


import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./CapturePage.css";

const CapturePage = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    validateImage(imageSrc);
  };

  const validateImage = async (imageSrc) => {
    setLoading(true);
    setError("");

    try {
      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const brightness = calculateBrightness(imageData);
        if (brightness < 50) {
          throw new Error("The image is too dark. Please ensure proper lighting.");
        }

        if (!checkClarity(imageData)) {
          throw new Error("The image is too blurry. Please ensure better focus.");
        }

        if (!detectTongue(imageData)) {
          throw new Error(
            "No tongue detected. Please ensure your tongue is visible and centered."
          );
        }

        setError("");
      };
    } catch (err) {
      setError(err.message);
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateBrightness = (imageData) => {
    const { data, width, height } = imageData;
    let totalBrightness = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      totalBrightness += (r + g + b) / 3;
    }

    return totalBrightness / (width * height);
  };

  const checkClarity = (imageData) => {
    const { data, width, height } = imageData;

    const grayscale = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      grayscale[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    const laplacianValues = computeLaplacian(grayscale, width, height);
    const variance = calculateVariance(laplacianValues);

    return variance > 50;
  };

  const computeLaplacian = (grayscale, width, height) => {
    const laplacianKernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
    const kernelSize = 3;
    const halfKernel = Math.floor(kernelSize / 2);

    const laplacianValues = new Float32Array(grayscale.length);

    for (let y = halfKernel; y < height - halfKernel; y++) {
      for (let x = halfKernel; x < width - halfKernel; x++) {
        let sum = 0;
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const pixelIndex = (y + ky) * width + (x + kx);
            const kernelIndex = (ky + halfKernel) * kernelSize + (kx + halfKernel);
            sum += grayscale[pixelIndex] * laplacianKernel[kernelIndex];
          }
        }
        laplacianValues[y * width + x] = Math.abs(sum);
      }
    }

    return laplacianValues;
  };

  const calculateVariance = (values) => {
    const total = values.length;
    const mean = values.reduce((sum, value) => sum + value, 0) / total;

    return (
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / total
    );
  };
  const detectTongue = (imageData) => {
    const { data, width, height } = imageData;
    let tonguePixels = 0;
    let totalPixels = 0;
    
    // Step 1: Apply color detection filter (strict red-pink range)
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Detect reddish or pinkish color (use stricter range)
        if (r > 120 && g < 90 && b < 100) {
            tonguePixels++;
        }
        totalPixels++;
    }

    const colorRatio = tonguePixels / totalPixels;

    // If less than 2% of the image has tongue-like color, return false
    if (colorRatio < 0.02) {
        return false;
    }

    // Step 2: Apply edge detection and shape analysis (basic contour method)
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    ctx.putImageData(imageData, 0, 0);

    // Convert image to grayscale (for edge detection)
    const grayscaleData = ctx.getImageData(0, 0, width, height);
    const grayImage = new Uint8Array(width * height);

    for (let i = 0; i < grayscaleData.data.length; i += 4) {
        const r = grayscaleData.data[i];
        const g = grayscaleData.data[i + 1];
        const b = grayscaleData.data[i + 2];
        grayImage[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    // Edge detection using Sobel or Canny-like algorithm (simplified)
    const edges = applySobelEdgeDetection(grayImage, width, height);

    // Step 3: Analyze edges and contours
    const contours = findContours(edges, width, height);

    // Step 4: If a valid contour that fits the tongue shape is detected, return true
    if (contours.length > 0 && contours.some((contour) => isTongueShape(contour))) {
        return true;
    }

    return false;
};

// Sobel edge detection (basic version)
const applySobelEdgeDetection = (image, width, height) => {
    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1],
    ];
    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1],
    ];

    const edges = new Array(width * height).fill(0);
    const halfWidth = Math.floor(width);
    const halfHeight = Math.floor(height);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0;
            let gy = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixelIndex = (y + ky) * width + (x + kx);
                    gx += image[pixelIndex] * sobelX[ky + 1][kx + 1];
                    gy += image[pixelIndex] * sobelY[ky + 1][kx + 1];
                }
            }

            const magnitude = Math.sqrt(gx * gx + gy * gy);
            edges[y * width + x] = magnitude;
        }
    }

    return edges;
};

// Function to find contours based on edge map (simplified version)
const findContours = (edges, width, height) => {
    const contours = [];
    const visited = new Array(width * height).fill(false);

    // Basic contour finding by grouping adjacent pixels
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            if (edges[idx] > 50 && !visited[idx]) {
                const contour = traceContour(x, y, edges, visited, width, height);
                contours.push(contour);
            }
        }
    }

    return contours;
};

// Function to trace the contour (simple method, can be expanded for complex shapes)
const traceContour = (startX, startY, edges, visited, width, height) => {
    const contour = [];
    const stack = [[startX, startY]];
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1],
    ];

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const idx = y * width + x;
        if (visited[idx] || edges[idx] <= 50) continue;

        visited[idx] = true;
        contour.push([x, y]);

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;

            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                stack.push([newX, newY]);
            }
        }
    }

    return contour;
};

// Function to validate if a contour matches the shape of a tongue
const isTongueShape = (contour) => {
    // A basic check for elongated, roughly central shape (adjust thresholds for accuracy)
    const length = contour.length;
    const aspectRatio = calculateAspectRatio(contour);

    // Tongue shapes are typically elongated and somewhat central in the image
    return length > 200 && aspectRatio > 1.5 && aspectRatio < 4;
};

// Function to calculate the aspect ratio of a contour
const calculateAspectRatio = (contour) => {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    contour.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    });

    const width = maxX - minX;
    const height = maxY - minY;

    return width / height;
};
  


  const retakeImage = () => {
    setImage(null);
    setError("");
  };

  const saveImage = () => {
    const link = document.createElement("a");
    link.href = image;
    link.download = "image.png";
    link.click();
  };  

  return (
    <div className="capture-container">
      <h2>Capture Tongue Image</h2>
      <p>
        Position your tongue in the center and align your lips with the overlay. Ensure that you are clicking the picture in good lighting conditions.
      </p>
      {!image ? (
        <div className="webcam-container">
          <div className="overlay-box">
            <img
              src={`${process.env.PUBLIC_URL}/tongue-overlay.png`}
              alt="Tongue Overlay"
              className="tongue-overlay"
            />
          </div>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam"
          />
          <button onClick={captureImage} className="capture-button">
            Capture Image
          </button>
        </div>
      ) : (
        <div className="review-container">
          <img src={image} alt="Captured" className="captured-image" />
          {error && <p className="error">{error}</p>}
          <div className="buttons">
            <button onClick={retakeImage} className="retake-button">
              Retake
            </button>
            {!error && (
              <>
              <button onClick={saveImage} className="save-button">
              Save Image
               </button>
              <button className="proceed-button">Proceed</button>
              </>
            )}
          </div>
        </div>
      )}
      {loading && <p>Validating image...</p>}
    </div>
  );
};

export default CapturePage;
