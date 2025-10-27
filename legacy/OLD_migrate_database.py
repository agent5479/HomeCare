#!/usr/bin/env python3
"""
Database Migration Script for BeeMarshall Enhanced Features
This script adds new fields to existing tables and creates new tables for enhanced functionality.
"""

import os
import sys
from datetime import datetime
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import config
from models import db, User, HiveCluster, IndividualHive, TaskType, HiveAction, DiseaseReport

def create_app():
    """Create Flask app for migration"""
    app = Flask(__name__)
    app.config.from_object(config['default'])
    db.init_app(app)
    return app

def migrate_database():
    """Perform database migration"""
    app = create_app()
    
    with app.app_context():
        print("Starting database migration...")
        
        # Create all tables (this will add new columns to existing tables)
        try:
            db.create_all()
            print("✓ Database tables created/updated successfully")
        except Exception as e:
            print(f"✗ Error creating tables: {e}")
            return False
        
        # Check if we need to add default values to existing records
        try:
            # Update existing HiveCluster records with default values for new fields
            clusters = HiveCluster.query.all()
            updated_count = 0
            
            for cluster in clusters:
                needs_update = False
                
                # Set default values for new fields if they are None
                if cluster.site_type is None:
                    cluster.site_type = 'summer'
                    needs_update = True
                
                if cluster.access_type is None:
                    cluster.access_type = 'all_weather'
                    needs_update = True
                
                if cluster.contact_before_visit is None:
                    cluster.contact_before_visit = False
                    needs_update = True
                
                if cluster.is_quarantine is None:
                    cluster.is_quarantine = False
                    needs_update = True
                
                # Set default values for hive setup fields
                if cluster.single_brood_boxes is None:
                    cluster.single_brood_boxes = 0
                    needs_update = True
                
                if cluster.double_brood_boxes is None:
                    cluster.double_brood_boxes = 0
                    needs_update = True
                
                if cluster.nucs is None:
                    cluster.nucs = 0
                    needs_update = True
                
                if cluster.dead_hives is None:
                    cluster.dead_hives = 0
                    needs_update = True
                
                if cluster.top_splits is None:
                    cluster.top_splits = 0
                    needs_update = True
                
                # Set default values for hive strength fields
                if cluster.strong_hives is None:
                    cluster.strong_hives = 0
                    needs_update = True
                
                if cluster.medium_hives is None:
                    cluster.medium_hives = 0
                    needs_update = True
                
                if cluster.weak_hives is None:
                    cluster.weak_hives = 0
                    needs_update = True
                
                if needs_update:
                    updated_count += 1
            
            if updated_count > 0:
                db.session.commit()
                print(f"✓ Updated {updated_count} existing cluster records with default values")
            else:
                print("✓ No existing records needed updates")
                
        except Exception as e:
            print(f"✗ Error updating existing records: {e}")
            db.session.rollback()
            return False
        
        # Verify the migration
        try:
            # Check that new fields exist
            cluster_count = HiveCluster.query.count()
            print(f"✓ Found {cluster_count} cluster records")
            
            # Test creating a new record with all fields
            test_cluster = HiveCluster(
                user_id=1,  # Assuming user ID 1 exists
                name="Migration Test",
                description="Test cluster for migration verification",
                latitude=0.0,
                longitude=0.0,
                hive_count=1,
                # New fields
                landowner_name="Test Landowner",
                landowner_phone="123-456-7890",
                landowner_email="test@example.com",
                landowner_address="123 Test St",
                site_type="summer",
                access_type="all_weather",
                contact_before_visit=True,
                is_quarantine=False,
                single_brood_boxes=1,
                double_brood_boxes=0,
                nucs=0,
                dead_hives=0,
                top_splits=0,
                strong_hives=1,
                medium_hives=0,
                weak_hives=0
            )
            
            db.session.add(test_cluster)
            db.session.commit()
            print("✓ Successfully created test record with all new fields")
            
            # Clean up test record
            db.session.delete(test_cluster)
            db.session.commit()
            print("✓ Cleaned up test record")
            
        except Exception as e:
            print(f"✗ Error during migration verification: {e}")
            return False
        
        print("\n🎉 Database migration completed successfully!")
        print("\nNew features available:")
        print("  • Landowner information tracking")
        print("  • Site classification (Summer/Winter, All weather/Dry only)")
        print("  • Contact before visit alerts")
        print("  • Quarantine functionality")
        print("  • Detailed hive setup tracking (Single/Double/Nuc/Dead/Top Splits)")
        print("  • Hive strength ratings (Strong/Medium/Weak)")
        print("  • Disease reporting system (AFB, Varroa, Chalkbrood, Sacbrood, DWV)")
        print("  • Enhanced field reporting interface")
        print("  • Improved UI with modern design principles")
        
        return True

if __name__ == "__main__":
    print("BeeMarshall Database Migration")
    print("=" * 40)
    
    if migrate_database():
        print("\n✅ Migration completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)

