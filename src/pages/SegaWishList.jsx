import React, { useEffect, useRef } from "react";

const SegaRing = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="sonic-ring">
    <ellipse cx="12" cy="12" rx="8" ry="10" fill="none" stroke="#ffcc00" strokeWidth="3" />
    <ellipse cx="12" cy="12" rx="4" ry="6" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
  </svg>
);

export const SegaWishList = () => {
  const globeRef = useRef(null);

  const tasks = [
    { id: "LOG_001", title: "TEMPORAL WINDOWS", desc: "Shift from timestamps to Breakfast/Lunch/Dinner windows.", status: "PENDING" },
    { id: "LOG_002", title: "MESH SYNC PROTOCOL", desc: "Shared Awareness so attendees see bookings they didn't create.", status: "CRITICAL" },
    { id: "LOG_003", title: "DYNAMIC REVENUE", desc: "Real-time fee calculator for party size and peak surcharges.", status: "IN_PROGRESS" },
    { id: "LOG_004", title: "RULE ARCHITECT", desc: "Move system constraints into a live database table.", status: "PLANNING" },
    { id: "LOG_005", title: "ARCHIVE VAULT", desc: "Read-only view for past/cancelled entries to maintain audit trails.", status: "PENDING" },
    { id: "LOG_006", title: "STATE MACHINE", desc: "Confirmed → Seated → Completed flow to automate fee triggers.", status: "IN_PROGRESS" },
    { id: "LOG_007", title: "OVERLORD DASHBOARD", desc: "Admin escalation for overriding room limits and fee management.", status: "STRETCH" },
    { id: "LOG_008", title: "DIETARY TAXONOMY", desc: "Replace string inputs with Enum-based tags (VEG, GF, CELIAC).", status: "OPTIMIZATION" },
  ];

  useEffect(() => {
    let angle = 0;
    const globe = globeRef.current;
    const interval = setInterval(() => {
      angle += 0.01;
      if (globe) globe.style.transform = `rotateY(${angle}rad) rotateX(${angle / 2}rad)`;
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sonic-crt-container">
      <div className="sega-background" />
      <div className="grid-globe" ref={globeRef} />

      <div className="wishlist-panel">
        <div className="wishlist-title">STERLING ZONE</div>
        <div className="wish-list">
          {tasks.map(task => (
            <div key={task.id} className="wish-item">
              <span style={{color: '#555', fontSize: '0.6rem'}}>{task.id}</span>
              <SegaRing />
              <div className="wish-content">
                <h3>{task.title}</h3>
                <p>{task.desc}</p>
              </div>
              <div className={`status-tag ${task.status}`}>{task.status.replace("_", " ")}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .sonic-crt-container {
          background: #0055cc;
          min-height: 100vh;
          padding: 4rem 2rem;
          font-family: 'Press Start 2P', monospace;
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        .sega-background {
          position: absolute;
          inset: 0;
          background-color: #aa6622;
          background-image: 
            linear-gradient(45deg, #885500 25%, transparent 25%, transparent 75%, #885500 75%, #885500),
            linear-gradient(45deg, #885500 25%, transparent 25%, transparent 75%, #885500 75%, #885500);
          background-size: 60px 60px;
          background-position: 0 0, 30px 30px;
          border-top: 12px solid #00cc00;
          box-shadow: inset 0 8px 0 #008800;
          z-index: 1;
        }

        .grid-globe {
          position: absolute;
          top: 10%;
          left: 50%;
          width: 100px;
          height: 100px;
          transform-style: preserve-3d;
          transform-origin: center;
          margin-left: -50px;
          border: 2px solid #ffff00;
          border-radius: 50%;
          box-shadow: 0 0 25px #ffcc00;
          z-index: 2;
        }

        .sonic-crt-container::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            rgba(255,255,255,0.05) 0px,
            rgba(255,255,255,0.05) 2px,
            transparent 2px,
            transparent 4px
          );
          z-index: 100;
        }

        .wishlist-panel {
          max-width: 900px;
          margin: 0 auto;
          border: 4px solid #fff;
          outline: 8px solid #000;
          padding: 2.5rem;
          background: rgba(0,0,80,0.9);
          position: relative;
          z-index: 10;
        }

        .wishlist-title {
          font-size: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          color: #ffcc00;
          text-shadow: 4px 4px 0 #0055ff, 8px 8px 0 #000;
          letter-spacing: 5px;
        }

        .wish-item {
          display: grid;
          grid-template-columns: 60px 50px 1fr 140px;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #111;
          border: 4px solid #333;
          margin-bottom: 10px;
        }

        .wish-content h3 { margin: 0; font-size: 0.8rem; color: #fff; }
        .wish-content p { margin: 0.3rem 0 0; font-size: 0.65rem; color: #ffcc00; line-height: 1.4; }

        .status-tag {
          padding: 0.4rem;
          border: 2px solid #fff;
          font-size: 0.6rem;
          text-align: center;
          background: #000;
        }

        .sonic-ring { filter: drop-shadow(0 0 5px #ffcc00); }
      `}</style>
    </div>
  );
};
