// src/components/shared/TutorialModal.jsx - FINAL VERSION WITH SELF + GUEST ACCESS
import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Check, AlertCircle } from "lucide-react";

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
    emoji: "⚠️",
    title: "IMPORTANT: Add Yourself First!",
    description:
      'Before making your first reservation, you MUST add yourself as a family member with relationship "SELF".',
    section: {
      title: "Why This Matters",
      items: [
        "The system automatically adds you to your own reservations",
        "You cannot be added as a guest if you're not in the family list",
        "Your account (login) and family member record are separate",
        "This lets the system track your guest allowance and dietary needs",
      ],
    },
    visual: {
      title: "STEP-BY-STEP: Add Yourself",
      items: [
        {
          color: "grey",
          label: "1. Click USERS Icon (👥)",
          desc: "Go to the Family page in the top navigation",
        },
        {
          color: "red",
          label: '2. Click "+ Add Member"',
          desc: "Opens the family member form",
        },
        {
          color: "grey",
          label: "3. Enter Your Name",
          desc: "Use your actual name (matches your account)",
        },
        {
          color: "red",
          label: '4. Relationship = "SELF"',
          desc: 'CRITICAL: Type exactly "SELF" or "Self" (not "Me" or "Owner")',
        },
      ],
    },
    tip: "⚠️ IMPORTANT: Do this NOW before making any reservations! Without a SELF member record, the system cannot add you as an attendee.",
  },
  {
    id: 3,
    emoji: "📅",
    title: "Making a Reservation",
    description:
      "After adding yourself as SELF, you can create reservations. Click the CALENDAR icon (📅) in navigation.",
    section: {
      title: "Booking Process",
      items: [
        "1. Select your date from the calendar",
        "2. Choose meal type: LUNCH (11 AM-2 PM) or DINNER (4 PM-7 PM)",
        "3. Pick your preferred dining room",
        "4. Select start and end times",
        "5. Add optional notes for special requests",
        "6. Click SAVE - You will be automatically added as the first attendee",
      ],
    },
    tip: "💡 After creating a reservation, you can add more guests from the detail page!",
  },
  {
    id: 4,
    emoji: "👨‍👩‍👧‍👦",
    title: "Managing Your Family",
    description:
      "Add family members to quickly include them in reservations. Each member can have dietary restrictions.",
    section: {
      title: "Family Management",
      items: [
        "SELF: Add yourself first (as explained in Step 2)",
        'Spouse/Partner: Add with relationship "Spouse" or "Partner"',
        'Children: Add with "Son", "Daughter", "Child"',
        'Extended Family: "Mother", "Father", "Sibling", etc.',
        "Each member tracks their own dietary restrictions",
        "Set guest allowance (how many non-family guests they can bring)",
      ],
    },
  },
  {
    id: 5,
    emoji: "🤝",
    title: "Shared Reservations (Coming Soon)",
    description:
      "Currently, only the account holder who created a reservation can view and modify it.",
    section: {
      title: "Current Limitations",
      items: [
        "❌ Family members with their own accounts cannot see shared bookings",
        "❌ If Dad creates a reservation, Mom cannot edit it (even if she has an account)",
        "❌ Each account only sees reservations they personally created",
        "✅ WORKAROUND: Share one account login among family members",
        "✅ OR: One person manages all reservations for the household",
      ],
    },
    tip: "💡 FUTURE FEATURE: Cross-account reservation sharing is planned! This will let family members with separate accounts view and edit shared bookings.",
  },
  {
    id: 6,
    emoji: "💰",
    title: "Understanding Fees",
    description:
      "Some reservations automatically apply fees based on club rules. All fees are shown before you confirm.",
    section: {
      title: "Common Automatic Fees",
      items: [
        "Peak Hours: Friday-Sunday reservations may have surcharges",
        "Large Party: Groups over 8 guests may incur additional fees",
        "Excess Guests: Beyond member guest allowances",
        "Example: If you have 2 guest allowance but bring 4 non-family guests, you pay for 2 extras",
        "All fees calculated automatically and shown on detail page",
      ],
    },
  },
  {
    id: 7,
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
          desc: "Trash can button - turns red on hover to cancel entire reservation",
        },
      ],
    },
    tip: "💡 Click anywhere on a card to see full details and manage guests!",
  },
  {
    id: 8,
    emoji: "🔍",
    title: "Managing Guests",
    description:
      "Click any reservation card to open the detail view where you can add/remove guests.",
    section: {
      title: "Available Actions",
      items: [
        "EDIT (pencil icon) - Modify date, time, room, or notes",
        "View current guest list with dietary restrictions",
        "QUICK-ADD buttons for your family members (appears on right sidebar)",
        "Manual ADD GUEST form for non-family attendees",
        "REMOVE button next to each guest to remove them from table",
        "Applied fees section showing all charges and totals",
      ],
    },
    tip: "⚠️ Remember: You can only edit reservations YOU created. Family members with separate accounts cannot edit your bookings.",
  },
  {
    id: 9,
    emoji: "💁",
    title: "Navigation & Help",
    description:
      "The navigation bar at the top has all your main tools. Hover over icons to see labels!",
    section: {
      title: "Top Navigation Icons (Left to Right)",
      items: [
        "🏠 HOME - Dashboard with all YOUR reservations (only ones you created)",
        "📅 CALENDAR - Create new reservation",
        "👥 USERS - Manage family members (add SELF first!)",
        "📋 RULES - View club policies and fees",
        "❓ HELP (right side) - Reopens this tutorial anytime",
        "👤 YOUR NAME - Shows you're logged in, logout button",
      ],
    },
    tip: "💡 Your data is cached for 5 minutes for faster loading. Refresh (F5) to get latest updates!",
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
                    {item.startsWith("❌") || item.startsWith("✅") ? (
                      <>
                        <span style={{ marginRight: "0.5rem" }}>
                          {item.slice(0, 2)}
                        </span>
                        <span>{item.slice(2)}</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} className="tutorial-check" />
                        <span>{item}</span>
                      </>
                    )}
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
