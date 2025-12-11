# Project Processes

This document outlines the key processes involved in the project, from model training to deployment and interaction.

## 1. Model Training and Preparation

The machine learning models used in this project are trained in separate Jupyter notebooks. Each model has its own training process, but they generally follow these steps:

1.  **Data Loading and Preprocessing**: Load the dataset and apply any necessary preprocessing steps, such as normalization, resizing, or vectorization.
2.  **Model Definition**: Define the model architecture. This can be a scikit-learn pipeline, a PyTorch neural network, or any other model type.
3.  **Training**: Train the model on the preprocessed data. This involves fitting the model to the training data and evaluating its performance on a validation set.
4.  **Saving the Model**: Once the model is trained, save it to a file. For scikit-learn models, this is typically a `.joblib` file. For PyTorch models, it's a `.pth` file.

After training, the models are prepared for deployment. This involves creating a `tar.gz` archive containing the model artifacts and the inference code.

-   **Inference Code**: An `inference.py` script is created with the following functions, as required by SageMaker:
    -   `model_fn(model_dir)`: Loads the saved model from the model directory.
    -   `input_fn(request_body, request_content_type)`: Deserializes the input data from the request.
    -   `predict_fn(input_data, model)`: Performs inference on the input data using the loaded model.
    -   `output_fn(prediction, content_type)`: Serializes the prediction results to be sent back in the response.
-   **Creating the Archive**: The model artifacts (e.g., `model.joblib`, `vectorizer.joblib`) and the `code` directory (containing `inference.py`) are packaged into a `model.tar.gz` file.

## 2. Deployment to SageMaker

The `deploy.ipynb` notebook orchestrates the deployment of the models to Amazon SageMaker. The process is as follows:

1.  **Upload to S3**: The `model.tar.gz` archives for each model are uploaded to an S3 bucket.
2.  **Create SageMaker Model**: For each model, a `sagemaker.Model` object is created. This object points to the S3 location of the model archive and specifies the Docker image to use for serving (e.g., scikit-learn, PyTorch).
3.  **Deploy to Endpoint**: The `deploy()` method is called on the SageMaker Model object to create an endpoint. This provisions the necessary infrastructure (e.g., EC2 instances) and deploys the model container.

## 3. Lambda Proxy and API Gateway

The `lambda_function.py` script and the API Gateway provide a serverless interface to the deployed models.

-   **Lambda Function**:
    -   Acts as a proxy that receives HTTP requests and invokes the appropriate SageMaker or Bedrock endpoint.
    -   Handles CORS, request routing, and error handling.
    -   Uses environment variables for configuration, making it easy to manage endpoint names.
-   **API Gateway**:
    -   Provides a public HTTP endpoint that triggers the Lambda function.
    -   Manages request/response transformations and authorizers (if needed).

## 4. Web Interface

The `page` directory contains a React-based web application that provides a user-friendly interface to interact with the models.

-   **Components**: The application is built with reusable React components for different functionalities, such as:
    -   Image upload for the MNIST models.
    -   Text input for the sentiment analysis and chat models.
    -   Display of prediction results.
-   **API Integration**: The web application makes API calls to the API Gateway endpoint to send user input and receive model predictions.
-   **Deployment**: The React application is built and the static files (`index.html`, `main.jsx`, etc.) are deployed to an S3 bucket configured for static website hosting.

This end-to-end architecture allows for a scalable and maintainable system where models can be updated and deployed independently of the web application, and the serverless backend handles the interaction between the two.