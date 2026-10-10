#!/usr/bin/env python3
"""
Automated AWS Location Service Setup for HeatRoute
Creates:
  1. Amazon Location Service Map ('HeatRouteMap' with VectorHereExploreDark style)
  2. Amazon Location Service API Key ('HeatRouteMapApiKey' with geo:GetMap* access)
  3. Writes frontend/.env.local with credentials
"""

import os
import sys
import argparse
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Set up Amazon Location Service for HeatRoute")
    parser.add_argument("--region", default=os.getenv("AWS_DEFAULT_REGION", "ap-south-1"), help="AWS Region (default: ap-south-1)")
    parser.add_argument("--access-key-id", default=os.getenv("AWS_ACCESS_KEY_ID"), help="AWS Access Key ID")
    parser.add_argument("--secret-access-key", default=os.getenv("AWS_SECRET_ACCESS_KEY"), help="AWS Secret Access Key")
    parser.add_argument("--map-name", default="HeatRouteMap", help="Map resource name")
    parser.add_argument("--key-name", default="HeatRouteMapApiKey", help="API Key resource name")
    parser.add_argument("--style", default="VectorHereExploreDark", help="Map style (e.g. VectorHereExploreDark, VectorEsriDarkGrayCanvas)")
    args = parser.parse_args()

    try:
        import boto3
        from botocore.exceptions import ClientError
    except ImportError:
        print("❌ 'boto3' is required. Run: pip install boto3")
        sys.exit(1)

    # Initialize Location client
    session_kwargs = {"region_name": args.region}
    if args.access_key_id and args.secret_access_key:
        session_kwargs["aws_access_key_id"] = args.access_key_id
        session_kwargs["aws_secret_access_key"] = args.secret_access_key

    session = boto3.Session(**session_kwargs)
    client = session.client("location")

    print(f"\n🌍 Connecting to AWS Region: {args.region}...")

    # 1. Create or verify Map resource
    map_arn = None
    try:
        desc = client.describe_map(MapName=args.map_name)
        map_arn = desc["MapArn"]
        print(f"✅ Existing Map found: {args.map_name} ({desc.get('DataSource', 'HERE')})")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceNotFoundException":
            print(f"🚀 Creating Amazon Location Map: {args.map_name} (Style: {args.style})...")
            resp = client.create_map(
                MapName=args.map_name,
                Configuration={"Style": args.style},
                Description="HeatRoute dark navigation vector map style for pedestrian microclimate rendering"
            )
            map_arn = resp["MapArn"]
            print(f"✅ Map created successfully: {map_arn}")
        else:
            print(f"❌ Error checking/creating Map: {e}")
            sys.exit(1)

    # 2. Create or verify API Key
    api_key_value = None
    try:
        desc_key = client.describe_key(KeyName=args.key_name)
        print(f"⚠️ Existing API Key found: {args.key_name}")
        # Note: AWS only returns the actual key value upon creation or if retrieved via get_key
        # If already created, prompt or create a new uniquely suffixed key
        api_key_value = desc_key.get("Key")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceNotFoundException":
            pass
        else:
            print(f"❌ Error checking API Key: {e}")
            sys.exit(1)

    if not api_key_value:
        print(f"🔑 Creating Amazon Location API Key: {args.key_name}...")
        try:
            resp_key = client.create_key(
                KeyName=args.key_name,
                Description="API key for HeatRoute MapLibre GL frontend tile streaming",
                NoExpiry=True,
                Restrictions={
                    "AllowActions": ["geo:GetMap*"],
                    "AllowResources": [map_arn]
                }
            )
            api_key_value = resp_key.get("Key")
            print(f"✅ API Key created successfully!")
        except ClientError as e:
            if "ConflictException" in str(e) or "already exists" in str(e):
                print(f"Notice: Key '{args.key_name}' already exists. Creating with timestamp...")
                import time
                new_key_name = f"{args.key_name}-{int(time.time())}"
                resp_key = client.create_key(
                    KeyName=new_key_name,
                    Description="API key for HeatRoute MapLibre GL frontend tile streaming",
                    NoExpiry=True,
                    Restrictions={
                        "AllowActions": ["geo:GetMap*"],
                        "AllowResources": [map_arn]
                    }
                )
                api_key_value = resp_key.get("Key")
                print(f"✅ Generated new key: {new_key_name}")
            else:
                print(f"❌ Failed to create API Key: {e}")
                sys.exit(1)

    if not api_key_value:
        print("❌ Could not obtain API key value from AWS response.")
        sys.exit(1)

    # 3. Write frontend/.env.local
    repo_root = Path(__file__).resolve().parent.parent
    env_local_path = repo_root / "frontend" / ".env.local"

    env_content = f"""# Automatically configured by scripts/setup_aws_location.py
VITE_AWS_LOCATION_MAP_NAME={args.map_name}
VITE_AWS_LOCATION_API_KEY={api_key_value}
VITE_AWS_REGION={args.region}
VITE_BACKEND_URL=http://127.0.0.1:8000
"""

    with open(env_local_path, "w", encoding="utf-8") as f:
        f.write(env_content)

    print(f"\n🎉 SUCCESS! Configured frontend/.env.local with AWS credentials:")
    print(f"   Map Name: {args.map_name}")
    print(f"   Region:   {args.region}")
    print(f"   API Key:  {api_key_value[:18]}...{api_key_value[-8:]}")
    print(f"\n👉 Restart frontend to see live AWS maps: cd frontend && npm run dev\n")

if __name__ == "__main__":
    main()
