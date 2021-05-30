import { useEffect, useRef, useState } from "react";
import { useGetSet } from "react-use";

const getCoord = (i: number, mod: number, radius: number): [number, number] => {
  const x = Math.cos((i * 2 * Math.PI) / mod) * radius;
  const y = -Math.sin((i * 2 * Math.PI) / mod) * radius;

  return [x, y];
};

const IndexPage = () => {
  const [radius, setRadius] = useGetSet(300);
  const [multiplier, setMultiplier] = useGetSet(2.5);
  const [mod, setMod] = useGetSet(10);
  const [showLabel, setShowLabel] = useGetSet(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let requestId: number;

    const getPixelRatio = (context: any) => {
      var backingStore =
        context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio ||
        1;
      return (window.devicePixelRatio || 1) / backingStore;
    };
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      let ratio = getPixelRatio(ctx);
      let width = getComputedStyle(canvas)
        .getPropertyValue("width")
        .slice(0, -2);
      let height = getComputedStyle(canvas)
        .getPropertyValue("height")
        .slice(0, -2);
      const scaledRadius = radius() * ratio;

      canvas.width = +width * ratio;
      canvas.height = +height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.strokeStyle = "#eeeeee";

      ctx.fillStyle = "#eeeeee";
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.beginPath();
      ctx.arc(0, 0, scaledRadius, 0, Math.PI * 2);
      ctx.stroke();


      for (let i = 0; i < mod(); i++) {
        const [xFactor, yFactor] = getCoord(i, mod(), scaledRadius);
        const x = xFactor;
        const y = yFactor;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2, true);
        ctx.fill();
      }

      for (let i = 0; i < mod(); i++) {
        const [xFactor, yFactor] = getCoord(i, mod(), scaledRadius + 15);

        const textX = xFactor;
        const textY = yFactor;
        if (showLabel()) {
          ctx.save();
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.translate(textX, textY);
          // i: 0 -> mod / 2
          // angle: pi/2 -> -pi/2
          // i: mod / 2 -> mod
          // angle: pi/2 -> -pi/2
          ctx.rotate(Math.PI / 2 - (((i * 2 * Math.PI) / mod()) % Math.PI));
          ctx.fillText(`${i}`, 0, 0);
          ctx.restore();
        }
      }

      const drawnSet = new Set<number>();

      for (let i = 1; i < mod(); i++) {
        let current = i;
        if (drawnSet.has(i)) continue;
        drawnSet.add(i);
        while (current < mod()) {
          const next = current * multiplier();
          const currentCoord = getCoord(current, mod(), scaledRadius);
          const nextCoord = getCoord(next, mod(), scaledRadius);

          if (currentCoord && nextCoord) {
            ctx.moveTo(currentCoord[0], currentCoord[1]);
            ctx.lineTo(nextCoord[0], nextCoord[1]);
            ctx.stroke();
          }
          current = next;
        }
      }
      requestId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(requestId);
    };
  }, []);
  return (
    <div className="flex flex-row items-start">
      <div className="control-column">
        <div className="control-item">
          <label>Radius: {radius()}</label>
          <input
            type="range"
            min={40}
            max={400}
            value={radius()}
            onChange={(e) => setRadius(parseInt(e.target.value))}
          />
        </div>
        <div className="control-item">
          <label>Multiplier: {multiplier()}</label>
          <input
            type="range"
            min={2}
            max={100}
            step={0.1}
            value={multiplier()}
            onChange={(e) => setMultiplier(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-item">
          <label>Mod: {mod()}</label>
          <input
            type="range"
            min={1}
            max={200}
            step={0.1}
            value={mod()}
            onChange={(e) => setMod(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-item">
          <label>Label?</label>
          <input
            type="checkbox"
            checked={showLabel()}
            onChange={(e) => setShowLabel(e.target.checked)}
          />
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{ height: 2 * radius() + 50, width: 2 * radius() + 50 }}
      />
    </div>
  );
};

export default IndexPage;
