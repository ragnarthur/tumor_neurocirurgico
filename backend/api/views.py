import base64
from io import BytesIO

from django.conf import settings
from PIL import Image
from rest_framework.parsers import MultiPartParser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import PredictionResponseSerializer
from .utils.ml import load_model, predict, generate_heatmap


DISCLAIMER = "Protótipo educacional/pesquisa. Não é dispositivo médico e não deve ser usado para diagnóstico."


class HealthView(APIView):
    def get(self, request):
        return Response({"status": "ok"})


class PredictView(APIView):
    parser_classes = [MultiPartParser]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._model = None 
        self._classes = None
        self._image_size = None
        self._mean = None
        self._std = None
        self._arch = None

    def _get_model(
        self,
    ) -> tuple[object, list[str] | None, int | None, list[float] | None, list[float] | None, str | None]:
        if self._model is None:
            (
                self._model,
                self._classes,
                self._image_size,
                self._mean,
                self._std,
                self._arch,
            ) = load_model(str(settings.MODEL_PATH))
        return self._model, self._classes, self._image_size, self._mean, self._std, self._arch

    def post(self, request: Request) -> Response:
        if "file" not in request.FILES:
            return Response({"error": "file is required"}, status=400)

        image_file = request.FILES["file"]
        try:
            image = Image.open(image_file).convert("RGB")
        except Exception:
            return Response({"error": "invalid image"}, status=400)

        model, classes, image_size, mean, std, arch = self._get_model()
        if classes is None or image_size is None or mean is None or std is None or arch is None:
            return Response({"error": "model not loaded"}, status=500)
        predicted_class, probs, input_tensor = predict(model, classes, image_size, mean, std, image)
        class_index = classes.index(predicted_class)
        heatmap_b64 = generate_heatmap(model, input_tensor, image, class_index, image_size, arch)

        payload = {
            "predicted_class": predicted_class,
            "probs": probs,
            "heatmap_png_base64": heatmap_b64,
            "disclaimer": DISCLAIMER,
        }
        serializer = PredictionResponseSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)
