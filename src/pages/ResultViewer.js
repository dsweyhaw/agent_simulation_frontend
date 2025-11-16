import React from "react";
import { useEffect, useState, useRef } from "react";
import {
  getImageResultFromRange,
  getCategoriesResult,
  getExperimentResultDetail,
  getTsunamiStatistics,
} from "../api/simulationApi";
import SimulationParameterDisplay from "../components/SimulationParameterDisplay";
import TsunamiStatisticsView from "../components/TsunamiStatisticsView";
import ImageModal from "../components/ImageModal";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

import { quantum } from "ldrs";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function ResultViewer() {
  const FRAME_RATE = 45;
  const { resultId } = useParams();
  const [searchParams] = useSearchParams();
  const finalStep = parseInt(searchParams.get("finalStep"));
  const [currentStep, setCurrentStep] = useState(0);
  const [displayStep, setDisplayStep] = useState(0);
  const [categoryId, setCategoryId] = useState([]);
  const [inputStep, setInputStep] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const eventSourceRef = useRef(null);
  
  // New states for Tsunami features
  const [isTsunamiProject, setIsTsunamiProject] = useState(false);
  const [simulationParameters, setSimulationParameters] = useState({});
  const [statsData, setStatsData] = useState(null);
  const [showStats, setShowStats] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState({ src: "", alt: "", name: "" });

  quantum.register();

  const actualStepToDisplayStep = (step) => Math.floor(step / FRAME_RATE);
  const displayStepToActualStep = (display) => display * FRAME_RATE;

  const formatRealTime = (step) => {
    const totalSeconds = step * 60;
    const days = Math.floor(totalSeconds / (24 * 3600));
    const remainingSeconds = totalSeconds % (24 * 3600);
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const formattedDays = days.toString().padStart(2, "0");
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return days > 0
      ? `Day ${formattedDays}, ${formattedHours}:${formattedMinutes}:${formattedSeconds}s`
      : `${formattedHours}:${formattedMinutes}:${formattedSeconds}s`;
  };

  useEffect(() => {
    if (currentStep === 0) {
      const getCategories = async () => {
        await getCategoriesResult(resultId).then((response) => {
          response.data.data.forEach((category) => {
            setCategoryId((prevCategoryId) => [
              ...prevCategoryId,
              { id: category.id, name: category.name },
            ]);
          });
        });
      };
      getCategories();
      
      // Get experiment details to detect Tsunami project
      const getExperimentDetails = async () => {
        try {
          const response = await getExperimentResultDetail(resultId);
          const modelName = response.data.data.modelName?.toLowerCase() || '';
          const experimentName = response.data.data.experimentName?.toLowerCase() || '';
          
          const isTsunami = modelName.includes('tsunami') || 
                           experimentName.includes('tsunami') ||
                           modelName.includes('tsunami.gaml');
          
          console.log("🌊 Individual ResultViewer - Tsunami detection:", {
            modelName: response.data.data.modelName,
            experimentName: response.data.data.experimentName,
            isTsunami,
            fullResponse: response.data.data
          });
          
          setIsTsunamiProject(isTsunami);
          
          if (isTsunami) {
            // Extract parameters from API response
            const gamaParams = response.data.data.gamaParams || {};
            console.log("📋 Extracted gamaParams:", gamaParams);
            
            // Map API parameter keys to display format
            const mappedParams = {};
            
            // Map from API format to display format
            if (gamaParams.locals_number !== undefined) {
              mappedParams["Number of locals"] = String(gamaParams.locals_number);
            }
            if (gamaParams.tourists_number !== undefined) {
              mappedParams["Number of tourists"] = String(gamaParams.tourists_number);
            }
            if (gamaParams.rescuers_number !== undefined) {
              mappedParams["Number of rescuers"] = String(gamaParams.rescuers_number);
            }
            if (gamaParams.tourist_strategy !== undefined) {
              mappedParams["Tourist Movement Strategy"] = String(gamaParams.tourist_strategy);
            }
            if (gamaParams.car_strategy !== undefined) {
              mappedParams["Car Strategy"] = String(gamaParams.car_strategy);
            }
            if (gamaParams.tsunami_nb_segments !== undefined) {
              mappedParams["Tsunami Segments"] = String(gamaParams.tsunami_nb_segments);
            }
            if (gamaParams.tsunami_approach_time !== undefined) {
              mappedParams["Approach Time"] = String(gamaParams.tsunami_approach_time);
            }
            if (gamaParams.tsunami_speed_avg !== undefined) {
              mappedParams["Tsunami Speed"] = String(gamaParams.tsunami_speed_avg);
            }
            
            // Also handle direct format if API returns in display format
            if (gamaParams["Number of locals"] !== undefined) {
              mappedParams["Number of locals"] = String(gamaParams["Number of locals"]);
            }
            if (gamaParams["Number of tourists"] !== undefined) {
              mappedParams["Number of tourists"] = String(gamaParams["Number of tourists"]);
            }
            if (gamaParams["Number of rescuers"] !== undefined) {
              mappedParams["Number of rescuers"] = String(gamaParams["Number of rescuers"]);
            }
            if (gamaParams["Tourist Movement Strategy"] !== undefined) {
              mappedParams["Tourist Movement Strategy"] = String(gamaParams["Tourist Movement Strategy"]);
            }
            
            console.log("✅ Mapped parameters:", mappedParams);
            
            if (Object.keys(mappedParams).length > 0) {
              setSimulationParameters(mappedParams);
            } else {
              console.warn("⚠️ No parameters found in API response, using empty object");
              setSimulationParameters({});
            }
          }
        } catch (error) {
          console.error("Error fetching experiment details:", error);
        }
      };
      
      getExperimentDetails();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [resultId]);

  const startAnimation = () => {
    setIsPlaying(true);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const endStep = finalStep - 1;
    const speedNanoseconds = speed * 1_000_000;
    const apiUrl = `${process.env.REACT_APP_API_URL}/experiment_result_images/multi_experiment_animation?experiment_result_id=${resultId}&start_step=${currentStep}&end_step=${endStep}&duration=${speedNanoseconds}`;

    eventSourceRef.current = new EventSource(apiUrl);

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.steps && data.steps.length > 0) {
        const step = data.steps[0];
        setCurrentStep(step.step);
        setDisplayStep(actualStepToDisplayStep(step.step));

        const newImages = step.categories.map((category) => {
          const categoryName = categoryId.find(
            (cat) => cat.id === category.categoryId
          )?.name;
          return {
            id: category.categoryId,
            encodedImage: category.encodedImage,
            name: categoryName,
          };
        });

        setImages(newImages);
      }
    };

    eventSourceRef.current.onerror = () => {
      stopAnimation();
    };
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Load statistics when animation stops (for Tsunami)
    if (isTsunamiProject && !showStats) {
      loadTsunamiStatistics();
    }
  };
  
  const loadTsunamiStatistics = async () => {
    try {
      console.log("🌊 Loading Tsunami statistics for individual result:", resultId);
      setShowStats(true);
      const response = await getTsunamiStatistics(resultId);
      console.log("📊 Individual Tsunami statistics response:", response.data);
      setStatsData(response.data.data);
    } catch (error) {
      console.error("❌ Error loading individual Tsunami statistics:", error);
    }
  };

  // Handle image click to open modal
  const handleImageClick = (image) => {
    setModalImage({
      src: `data:image/jpeg;base64,${image.encodedImage}`,
      alt: image.name,
      name: image.name
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImage({ src: "", alt: "", name: "" });
  };

  const resetToStart = () => {
    stopAnimation();
    setCurrentStep(0);
    setDisplayStep(0);
    setInputStep(0);
  };

  const goToEnd = () => {
    stopAnimation();
    const lastStep = finalStep - 1;
    setCurrentStep(lastStep);
    setDisplayStep(actualStepToDisplayStep(lastStep));
    setInputStep(actualStepToDisplayStep(lastStep));
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    if (isPlaying) {
      stopAnimation();
      setTimeout(startAnimation, 0);
    }
  };

  const getImages = async () => {
    if (categoryId.length !== 0) {
      setLoading(true);
      await getImageResultFromRange(resultId, currentStep, currentStep).then(
        (response) => {
          const newImages = [];
          response.data.data.steps.forEach((step) => {
            step.categories.forEach((category) => {
              const categoryName = categoryId.find(
                (cat) => cat.id === category.categoryId
              )?.name;
              newImages.push({
                id: category.categoryId,
                encodedImage: category.encodedImage,
                name: categoryName,
              });
            });
          });
          setImages(newImages);
        }
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isPlaying) {
      setImages([]);
      getImages();
    }
  }, [currentStep, categoryId, isPlaying]);

  const handleChange = (e) => {
    setError(false);
    const newDisplayStep = parseInt(e.target.value);
    setInputStep(newDisplayStep);
  };

  const handleStepInput = () => {
    const maxDisplayStep = actualStepToDisplayStep(finalStep - 1);
    if (inputStep > maxDisplayStep || inputStep < 0) {
      setError(true);
      return;
    }
    const newActualStep = displayStepToActualStep(inputStep);
    setCurrentStep(newActualStep);
    setDisplayStep(inputStep);
  };

  return (
    <div>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-center text-4xl font-semibold mt-2">
          Step: {displayStep}
        </h1>
        <div className="flex items-center gap-2 text-2xl text-gray-600">
          <ClockIcon className="size-6" />
          <span>{formatRealTime(currentStep)}</span>
        </div>
      </div>

      <div className="mx-auto max-w-xl mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-900">Speed</span>
          <input
            type="range"
            min="1"
            max="1501"
            step="10"
            value={speed}
            onChange={handleSpeedChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="mx-auto relative w-fit place-content-center flex gap-2">
        <button
          type="button"
          onClick={resetToStart}
          disabled={isPlaying}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
        >
          <BackwardIcon className="size-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (currentStep >= FRAME_RATE) {
              const newStep = currentStep - FRAME_RATE;
              setCurrentStep(newStep);
              setDisplayStep(actualStepToDisplayStep(newStep));
              setInputStep(actualStepToDisplayStep(newStep));
            }
          }}
          disabled={isPlaying}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
        >
          <ChevronLeftIcon className="size-5" />
        </button>

        <button
          type="button"
          onClick={isPlaying ? stopAnimation : startAnimation}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          {isPlaying ? (
            <PauseIcon className="size-5" />
          ) : (
            <PlayIcon className="size-5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (currentStep + FRAME_RATE < parseInt(finalStep)) {
              const newStep = currentStep + FRAME_RATE;
              setCurrentStep(newStep);
              setDisplayStep(actualStepToDisplayStep(newStep));
              setInputStep(actualStepToDisplayStep(newStep));
            }
          }}
          disabled={isPlaying}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
        >
          <ChevronRightIcon className="size-5" />
        </button>

        <button
          type="button"
          onClick={goToEnd}
          disabled={isPlaying}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
        >
          <ForwardIcon className="size-5" />
        </button>
      </div>

      <div className="mx-auto relative max-w-xl place-content-center mt-4">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <MagnifyingGlassIcon className="size-5 text-gray-900" />
        </div>

        <input
          type="number"
          id="search"
          value={inputStep}
          onChange={handleChange}
          disabled={isPlaying}
          className="block w-full p-4 ps-10 text-md text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-50 disabled:opacity-50"
          placeholder={`Step 0 (${formatRealTime(
            0
          )}) to ${actualStepToDisplayStep(finalStep - 1)} (${formatRealTime(
            finalStep - 1
          )})`}
          required
        />
        <button
          type="submit"
          className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-4 py-2 disabled:opacity-50"
          onClick={handleStepInput}
          disabled={isPlaying}
        >
          View step
        </button>
      </div>

      <div className="max-w-xl mx-auto">
        {error && (
          <p className="mt-2 text-sm text-red-600">
            <span className="font-medium">
              Invalid input! Please choose step between 0 and{" "}
              {actualStepToDisplayStep(finalStep - 1)}
            </span>
          </p>
        )}
      </div>

      {/* Display simulation parameters for Tsunami */}
      {isTsunamiProject && Object.keys(simulationParameters).length > 0 && (
        <div className="max-w-4xl mx-auto mt-6 mb-6">
          <SimulationParameterDisplay 
            parameters={simulationParameters} 
            isTsunamiProject={isTsunamiProject}
            compact={false}
          />
        </div>
      )}

      {loading ? (
        <div className="h-screen w-screen place-content-center">
          <div className="flex justify-center">
            <l-quantum size="250" speed="1.75" color="#3b82f6"></l-quantum>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 items-center place-content-center mx-4 my-12">
          {images.map((image, index) => (
            <div key={index}>
              <div 
                className="mx-auto bg-white border w-fit p-5 border-gray-300 rounded-lg shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
                onClick={() => handleImageClick(image)}
              >
                <div className="relative">
                  <img
                    alt={image.name}
                    src={`data:image/jpeg;base64,${image.encodedImage}`}
                  />
                  {/* Click indicator */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="bg-white/90 rounded-full p-2">
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <h1 className="text-center text-2xl my-4">{image.name}</h1>
            </div>
          ))}
        </div>
      )}

      {/* Display Tsunami Statistics after images (when animation is complete) */}
      {isTsunamiProject && showStats && statsData && (
        <div className="max-w-7xl mx-auto mt-12 mb-8 px-4">
          <TsunamiStatisticsView data={statsData} />
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={closeModal}
        imageSrc={modalImage.src}
        imageAlt={modalImage.alt}
        imageName={modalImage.name}
      />
    </div>
  );
}

export default ResultViewer;
