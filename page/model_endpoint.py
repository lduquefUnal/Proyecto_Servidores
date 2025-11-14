import sagemaker
from sagemaker import get_execution_role

role = get_execution_role()

# Desplegar el modelo entrenado en un endpoint de SageMaker
predictor = sagemaker.predictor.RealTimePredictor(
    endpoint_name="tu-endpoint-de-sagemaker",
    sagemaker_session=sagemaker.Session(),
    role=role
)

predictor.deploy(instance_type="ml.m5.large", initial_instance_count=1)
