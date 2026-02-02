// src/components/shared/TutorialModal.jsx
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: "Welcome to Sterling Club!",
    content:
      "This quick tour will show you how to make reservations and manage your account. Take your time - you can restart this tutorial anytime from the Help menu.",
    image: "🏛️",
    tip: "Click Next to continue",
  },
  {
    id: 2,
    title: "Step 1: View Your Dashboard",
    content:
      "When you log in, you'll see your dashboard. This shows your upcoming reservations and quick actions.",
    whatToLook: [
      "Your upcoming reservations at the top",
      "Quick action buttons to make a new reservation",
      "Navigation menu to access different sections",
    ],
    image: "🏠",
  },
  {
    id: 3,
    title: "Step 2: Make a Reservation",
    content:
      "To book a table, click the 'New Reservation' button. You'll be guided through a simple form.",
    steps: [
      "Choose your date from the calendar",
      "Pick your preferred dining room",
      "Select a time that works for you",
      "Tell us how many people are coming",
      "Add your guests from your member list",
    ],
    image: "📅",
  },
  {
    id: 4,
    title: "Step 3: Managing Your Members",
    content:
      "Before making reservations, add your family and friends to your member list. This makes booking faster!",
    whatToLook: [
      "Go to 'Members' in the navigation",
      "Click 'Add Member'",
      "Enter their name and relationship (Spouse, Child, Friend, etc.)",
      "Save - they're now in your list!",
    ],
    image: "👨‍👩‍👧‍👦",
    tip: "You only need to add members once - they'll always be available for future reservations",
  },
  {
    id: 5,
    title: "Step 4: Understanding Fees",
    content:
      "Some reservations have additional fees based on club rules. You'll always see the total before confirming.",
    whatToLook: [
      "Large party fees (8+ guests)",
      "Peak hours surcharges (Friday/Saturday evenings)",
      "Cancellation policies",
    ],
    image: "💰",
    tip: "Check the 'Rules' page to see all fees",
  },
  {
    id: 6,
    title: "Step 5: Viewing Your Reservations",
    content:
      "Click on any reservation to see full details, add notes, or make changes.",
    whatToLook: [
      "Date, time, and location",
      "Who's attending",
      "Any fees applied",
      "Option to edit or cancel",
    ],
    image: "📋",
    tip: "You can cancel up to 48 hours before without penalty",
  },
  {
    id: 7,
    title: "Need Help?",
    content: "If you ever get stuck, don't worry! We're here to help.",
    steps: [
      "Click the '?' icon in the navigation to restart this tutorial",
      "Call the club at (555) 123-4567",
      "Email support@sterlingclub.com",
      "Visit us during office hours: Mon-Fri 9am-5pm",
    ],
    image: "💁",
    tip: "You're all set! Click 'Get Started' to begin using the app.",
  },
];

export function TutorialModal({ onClose, autoStart = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem("sterling_tutorial_seen");
    if (autoStart && !hasSeenTutorial) {
      setShow(true);
    }
  }, [autoStart]);

  const step = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem("sterling_tutorial_seen", "true");
    setShow(false);
    if (onClose) onClose();
  };

  const handleSkip = () => {
    localStorage.setItem("sterling_tutorial_seen", "true");
    setShow(false);
    if (onClose) onClose();
  };

  if (!show) return null;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal">
        {/* Header */}
        <div className="tutorial-header">
          <div className="tutorial-progress">
            <span className="tutorial-step-counter">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </span>
            <div className="tutorial-progress-bar">
              <div
                className="tutorial-progress-fill"
                style={{
                  width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="tutorial-skip-btn"
            title="Skip tutorial"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="tutorial-content">
          <div className="tutorial-emoji">{step.image}</div>
          <h2>{step.title}</h2>
          <p className="tutorial-description">{step.content}</p>

          {/* What to Look For */}
          {step.whatToLook && (
            <div className="tutorial-section">
              <h3>What to Look For:</h3>
              <ul className="tutorial-list">
                {step.whatToLook.map((item, idx) => (
                  <li key={idx}>
                    <Check size={16} className="tutorial-check" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Steps */}
          {step.steps && (
            <div className="tutorial-section">
              <h3>How to Do It:</h3>
              <ol className="tutorial-ordered-list">
                {step.steps.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Tip */}
          {step.tip && (
            <div className="tutorial-tip">
              <strong>💡 Tip:</strong> {step.tip}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="tutorial-footer">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="tutorial-btn tutorial-btn-secondary"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="tutorial-dots">
            {TUTORIAL_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`tutorial-dot ${idx === currentStep ? "active" : ""}`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="tutorial-btn tutorial-btn-primary"
          >
            {isLastStep ? (
              <>
                Get Started
                <Check size={20} />
              </>
            ) : (
              <>
                Next
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Quick help component for navbar
export function HelpButton() {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowTutorial(true)}
        className="help-btn"
        title="Need help? Click for tutorial"
      >
        <span className="help-icon">?</span>
        <span className="help-text">Help</span>
      </button>

      {showTutorial && (
        <TutorialModal
          onClose={() => setShowTutorial(false)}
          autoStart={false}
        />
      )}
    </>
  );
}
