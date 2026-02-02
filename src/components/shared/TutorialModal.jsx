// src/components/shared/TutorialModal.jsx
import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";

const tutorialSteps = [
  {
    id: 1,
    emoji: "🏛️",
    title: "Welcome to Sterling!",
    description:
      "This quick tour will help you understand how to use the system. Look for color-coded elements throughout the app!",
    visual: {
      title: "Color Guide",
      items: [
        {
          color: "red",
          label: "Reservation Cards",
          desc: "Your upcoming bookings with date, time, and location",
        },
        {
          color: "blue",
          label: "Navigation Icons",
          desc: "Home, Calendar, Family, Rules, and Help buttons",
        },
        {
          color: "green",
          label: "Success Messages",
          desc: "Confirmations when you save or complete actions",
        },
        {
          color: "grey",
          label: "Tables & Lists",
          desc: "Your family members and booking details",
        },
      ],
    },
  },
  {
    id: 2,
    emoji: "📅",
    title: "Making a Reservation",
    description:
      "Click the Calendar icon in the top navigation or the floating + button on mobile.",
    section: {
      title: "What to Look For",
      items: [
        "Date picker to select your preferred date",
        "Meal type selection (Lunch or Dinner)",
        "Room selection from available locations",
        "Time slot picker based on meal type",
        "Notes field for special requests",
      ],
    },
  },
  {
    id: 3,
    emoji: "👨‍👩‍👧‍👦",
    title: "Managing Family Members",
    description:
      "Add your family members so you can quickly add them to reservations.",
    section: {
      title: "What to Look For",
      items: [
        'Click "Family" icon in navigation',
        "Add member names and relationships",
        "Include dietary restrictions",
        "Quick-add buttons appear when making reservations",
      ],
    },
  },
  {
    id: 4,
    emoji: "💰",
    title: "Understanding Fees",
    description:
      "Some reservations may have automatic fees based on club rules.",
    section: {
      title: "Common Fees",
      items: [
        "Weekend/Peak Hours surcharge",
        "Large party fees (over 8 guests)",
        "Excess guest fees beyond member allowance",
        "All fees shown before you confirm",
      ],
    },
  },
  {
    id: 5,
    emoji: "📋",
    title: "Viewing Your Reservations",
    description:
      "Your reservations appear as color-coded cards on the homepage.",
    visual: {
      title: "Reading Reservation Cards",
      items: [
        {
          color: "red",
          label: "Date Block (Left)",
          desc: "Month and day in large numbers",
        },
        {
          color: "grey",
          label: "Details (Middle)",
          desc: "Time, room name, notes, guest count",
        },
        {
          color: "red",
          label: "Delete Button (Right)",
          desc: "Trash icon to cancel booking",
        },
      ],
    },
  },
  {
    id: 6,
    emoji: "🔍",
    title: "Reservation Details",
    description:
      "Click any reservation card to see full details and manage guests.",
    section: {
      title: "On the Detail Page",
      items: [
        "Edit button (pencil icon) - Modify time/date/room",
        "Current guest list with dietary restrictions",
        "Quick-add buttons for family members",
        "Add guest form for non-family attendees",
        "Applied fees and total charges",
      ],
    },
  },
  {
    id: 7,
    emoji: "💁",
    title: "Getting Help",
    description:
      "You can always return to this tutorial by clicking the Help button.",
    section: {
      title: "Where to Find Help",
      items: [
        "Help button (?) in top right navigation",
        "Hover over navigation icons for tooltips",
        "Check Rules page for club policies",
        "All changes save automatically",
      ],
    },
    tip: "Pro Tip: Your data is cached for faster loading. Refresh the page if you need the latest information from other users.",
  },
];

export function TutorialModal({ autoStart = false, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (autoStart) {
      const hasSeenTutorial = localStorage.getItem("sterling_tutorial_seen");
      if (!hasSeenTutorial) {
        setIsOpen(true);
      }
    }
  }, [autoStart]);

  const handleClose = () => {
    localStorage.setItem("sterling_tutorial_seen", "true");
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDotClick = (index) => {
    setCurrentStep(index);
  };

  // Allow external trigger
  useEffect(() => {
    const handleOpenTutorial = () => {
      setIsOpen(true);
      setCurrentStep(0);
    };

    window.openTutorial = handleOpenTutorial;

    return () => {
      delete window.openTutorial;
    };
  }, []);

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal">
        {/* Header */}
        <div className="tutorial-header">
          <div className="tutorial-progress">
            <span className="tutorial-step-counter">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <div className="tutorial-progress-bar">
              <div
                className="tutorial-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button
            onClick={handleClose}
            className="tutorial-skip-btn"
            title="Skip Tutorial"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="tutorial-content">
          <div className="tutorial-emoji">{step.emoji}</div>
          <h2>{step.title}</h2>
          <p className="tutorial-description">{step.description}</p>

          {/* Visual Guide with Color-Coded Examples */}
          {step.visual && (
            <div className="tutorial-visual-guide">
              <h3>{step.visual.title}</h3>
              <div className="tutorial-legend">
                {step.visual.items.map((item, index) => (
                  <div
                    key={index}
                    className={`tutorial-legend-item color-${item.color}`}
                  >
                    <div
                      className="tutorial-legend-color"
                      style={{
                        background:
                          item.color === "red"
                            ? "#eb5638"
                            : item.color === "blue"
                              ? "#3b82f6"
                              : item.color === "green"
                                ? "#10b981"
                                : "#757575",
                      }}
                    />
                    <div className="tutorial-legend-text">
                      <div className="tutorial-legend-label">{item.label}</div>
                      <div className="tutorial-legend-desc">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section with bullet points */}
          {step.section && (
            <div className="tutorial-section">
              <h3>{step.section.title}</h3>
              <ul className="tutorial-list">
                {step.section.items.map((item, index) => (
                  <li key={index}>
                    <Check size={16} className="tutorial-check" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tip */}
          {step.tip && (
            <div className="tutorial-tip">
              <strong>💡 {step.tip}</strong>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="tutorial-footer">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="tutorial-btn tutorial-btn-secondary"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="tutorial-dots">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`tutorial-dot ${index === currentStep ? "active" : ""}`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="tutorial-btn tutorial-btn-primary"
          >
            <span>
              {currentStep === tutorialSteps.length - 1
                ? "Get Started"
                : "Next"}
            </span>
            {currentStep === tutorialSteps.length - 1 ? (
              <Check size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
