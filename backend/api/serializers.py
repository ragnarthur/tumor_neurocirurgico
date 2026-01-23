from rest_framework import serializers


class PredictionResponseSerializer(serializers.Serializer):
    predicted_class = serializers.CharField()
    probs = serializers.DictField(child=serializers.FloatField())
    heatmap_png_base64 = serializers.CharField()
    disclaimer = serializers.CharField()
