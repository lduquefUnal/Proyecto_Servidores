# Usa una imagen base de PyTorch de AWS optimizada para Inferencias
# Reemplaza la URI con la de tu región y versión específica.
# Ejemplo: 763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-inference:2.1.0-cpu-py310-ubuntu20.04
# O si necesitas GPU: 763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-inference:2.1.0-gpu-py310-cu121-ubuntu20.04
FROM  public.ecr.aws/deep-learning-containers/pytorch-inference:2.6.0-cpu-py312-ubuntu22.04-ec2-v1.43

# Crea la carpeta /opt/ml/code donde SageMaker espera encontrar el código
# Esta carpeta ya puede existir en las imágenes de inferencia de AWS, pero es bueno ser explícito.
# Establece el directorio de trabajo
WORKDIR /opt/ml/code

# Copia los archivos de inferencia y dependencias
COPY requirements.txt .
COPY inference.py .

# Instala las dependencias de Python
# Las dependencias se instalan dentro del ambiente Python de la imagen base.
RUN pip install --no-cache-dir -r requirements.txt

# Define el script de entrada (entry point) que SageMaker ejecutará
# Esto le dice al servidor HTTP de SageMaker qué script debe cargar.
ENV SAGEMAKER_PROGRAM inference.py
#ll