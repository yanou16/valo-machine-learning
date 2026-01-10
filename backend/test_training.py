"""
Test script for ValoML Model Training with MLflow Experiment Tracking.
Run this from the backend directory: python test_training.py
"""
import sys
sys.path.insert(0, '.')

from analysis.ml_analyzer import train_cluster_model, load_cluster_model

# Sample Valorant team compositions for training
# Each list represents agents picked in a match
sample_compositions = [
    # Aggressive double duelist comps
    ["Jett", "Raze", "Omen", "Sova", "Sage"],
    ["Jett", "Reyna", "Brimstone", "Breach", "Killjoy"],
    ["Phoenix", "Neon", "Astra", "Fade", "Cypher"],
    ["Raze", "Yoru", "Viper", "Skye", "Sage"],
    
    # Control-heavy comps
    ["Jett", "Omen", "Viper", "Sova", "Killjoy"],
    ["Reyna", "Brimstone", "Astra", "KAY/O", "Sage"],
    ["Phoenix", "Omen", "Harbor", "Breach", "Cypher"],
    
    # Info-focused initiator comps
    ["Jett", "Omen", "Sova", "Fade", "Killjoy"],
    ["Raze", "Astra", "Skye", "Gekko", "Sage"],
    ["Reyna", "Brimstone", "Breach", "KAY/O", "Cypher"],
    
    # Sentinel-heavy defensive comps
    ["Jett", "Omen", "Sova", "Killjoy", "Cypher"],
    ["Phoenix", "Brimstone", "Fade", "Sage", "Chamber"],
    ["Raze", "Viper", "Skye", "Deadlock", "Killjoy"],
    
    # Balanced comps
    ["Jett", "Omen", "Sova", "Sage", "Chamber"],
    ["Reyna", "Astra", "Breach", "Killjoy", "Cypher"],
    ["Phoenix", "Brimstone", "Fade", "Sage", "Deadlock"],
]

if __name__ == "__main__":
    print("=" * 60)
    print("🎮 ValoML - K-Means Clustering Model Training")
    print("=" * 60)
    print()
    
    # Train the model with MLflow tracking
    result = train_cluster_model(
        compositions=sample_compositions,
        n_clusters=5,
        random_state=42,
        model_dir="models",
        model_filename="valorant_kmeans_v1.pkl"
    )
    
    print()
    print("=" * 60)
    print("📊 TRAINING RESULTS")
    print("=" * 60)
    
    if result.get("success"):
        print(f"✅ Model saved to: {result['model_path']}")
        print()
        print("📈 Metrics:")
        print(f"   - Inertia: {result['metrics']['inertia']:.2f}")
        print(f"   - Silhouette Score: {result['metrics']['silhouette_score']:.4f}")
        print()
        print("⚙️  Parameters:")
        print(f"   - n_clusters: {result['parameters']['n_clusters']}")
        print(f"   - random_state: {result['parameters']['random_state']}")
        print(f"   - n_samples: {result['parameters']['n_samples']}")
        print(f"   - features: {result['parameters']['features_used']}")
        
        if result.get("mlflow_run_id"):
            print()
            print(f"🔬 MLflow Run ID: {result['mlflow_run_id']}")
            print("   View at: http://localhost:5000")
    else:
        print(f"❌ Error: {result.get('error')}")
    
    print()
    print("=" * 60)
    
    # Test loading the model
    print()
    print("🔄 Testing model loading...")
    loaded = load_cluster_model("models/valorant_kmeans_v1.pkl")
    if loaded:
        print(f"✅ Model loaded successfully!")
        print(f"   - n_clusters: {loaded['n_clusters']}")
        print(f"   - features: {loaded['features_used']}")
