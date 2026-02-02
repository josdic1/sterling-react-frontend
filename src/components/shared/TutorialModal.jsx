// src/components/shared/TutorialModal.jsx - COMPLETE FIXED VERSION
import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";

const tutorialSteps = [
  {
    id: 1,
    emoji: "🏛️",
    title: "Welcome to Sterling!",
    description:
      "This quick tour will help you understand the app layout and color system.",
    visual: {
      title: "COLOR GUIDE",
      items: [
        {
          color: "red",
          label: "RED/ORANGE Accent",
          desc: "Reservation date blocks, Delete buttons, Hover effects, Active links",
        },
        {
          color: "grey",
          label: "BLACK/GREY Text",
          desc: "Navigation links (before hover), Table text, Guest details, All main content",
        },
        {
          color: "green",
          label: "GREEN Success",
          desc: "Success messages, Checkmarks, Confirmation notifications",
        },
        {
          color: "blue",
          label: "BLUE Info (Rare)",
          desc: "Info messages only - not used in main navigation",
        },
      ],
    },
    tip: "💡 TIP: The red/orange accent color (#EB5638) is your primary action color throughout the app!",
  },
  {
    id: 2,
    emoji: "📅",
    title: "Making a Reservation",
    description:
      "Click the CALENDAR icon (📅) in the top navigation, or use the floating RED + button on mobile.",
    section: {
      title: "Booking Process",
      items: [
        "1. Select your date from the calendar",
        "2. Choose meal type: LUNCH (11 AM-2 PM) or DINNER (4 PM-7 PM)",
        "3. Pick your preferred dining room",
        "4. Select start and end times",
        "5. Add optional notes for special requests",
        "6. Click SAVE to confirm your booking",
      ],
    },
  },
  {
    id: 3,
    emoji: "👨‍👩‍👧‍👦",
    title: "Managing Your Family",
    description:
      "Add family members to quickly include them in reservations. Click the USERS icon (👥) in navigation.",
    section: {
      title: "Family Management",
      items: [
        'Click "+ Add Member" to create new family records',
        'Enter name, relationship (e.g., "Son", "Daughter")',
        'Add dietary restrictions (e.g., "Vegetarian", "Nut Allergy")',
        "Family members appear as quick-add buttons when making reservations",
        "Edit or archive members anytime from the Family page",
      ],
    },
  },
  {
    id: 4,
    emoji: "💰",
    title: "Understanding Fees",
    description:
      "Some reservations automatically apply fees based on club rules. Click RULES icon (📋) to see all policies.",
    section: {
      title: "Common Automatic Fees",
      items: [
        "Peak Hours: Friday-Sunday reservations may have surcharges",
        "Large Party: Groups over 8 guests may incur additional fees",
        "Excess Guests: Beyond your member guest allowance",
        "All fees are calculated and shown BEFORE you confirm",
        "Fees appear on the reservation detail page",
      ],
    },
  },
  {
    id: 5,
    emoji: "📋",
    title: "Reading Reservation Cards",
    description:
      "Your reservations appear as cards on the homepage with a 3-section layout.",
    visual: {
      title: "CARD STRUCTURE (LEFT → MIDDLE → RIGHT)",
      items: [
        {
          color: "red",
          label: "LEFT: Date Block",
          desc: "Month (small red text) + Day (large black number) in grey box",
        },
        {
          color: "grey",
          label: "MIDDLE: Details",
          desc: "Time, Room name (CAPS), Notes (italic), Guest count with icon",
        },
        {
          color: "red",
          label: "RIGHT: Delete Icon",
          desc: "Trash can button - turns red on hover to confirm deletion",
        },
      ],
    },
    tip: "💡 Click anywhere on a card to see full details and manage guests!",
  },
  {
    id: 6,
    emoji: "🔍",
    title: "Reservation Detail Page",
    description:
      "Click any card to open the detail view where you can edit and manage guests.",
    section: {
      title: "Available Actions",
      items: [
        "EDIT (pencil icon) - Modify date, time, room, or notes",
        "View current guest list with dietary restrictions",
        "QUICK-ADD buttons for your family members",
        "Manual ADD GUEST form for non-family attendees",
        "Applied fees section showing all charges",
        "DELETE button (trash icon) to cancel entire reservation",
      ],
    },
  },
  {
    id: 7,
    emoji: "💁",
    title: "Navigation & Help",
    description:
      "The navigation bar at the top has all your main tools. Hover over icons to see labels!",
    section: {
      title: "Top Navigation Icons (Left to Right)",
      items: [
        "🏠 HOME - Dashboard with all your reservations",
        "📅 CALENDAR - Create new reservation",
        "👥 USERS - Manage family members",
        "📋 RULES - View club policies and fees",
        "❓ HELP (right side) - Reopens this tutorial anytime",
      ],
    },
    tip: "💡 Your data is cached for 5 minutes to make the app load faster. Refresh the page (F5) to get the latest updates from other users!",
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

  // Allow external trigger from Help button
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
              <strong>{step.tip}</strong>
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
