import { useEffect, useRef } from "react";
import { useGetSet } from "react-use";

const getCoord = (i: number, mod: number, radius: number): [number, number] => {
  const x = Math.cos((i * 2 * Math.PI) / mod) * radius;
  const y = -Math.sin((i * 2 * Math.PI) / mod) * radius;

  return [x, y];
};

const IndexPage = () => {
  const [radius, setRadius] = useGetSet(300);
  const [multiplier, setMultiplier] = useGetSet(3);
  const [mod, setMod] = useGetSet(50);
  const [showLabel, setShowLabel] = useGetSet(true);
  const [animateMultiplier, setAnimateMultiplier] = useGetSet(false);
  const [animateMod, setAnimateMod] = useGetSet(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let requestId: number;
    let lastCalledTime: number;
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

    const draw: FrameRequestCallback = (time) => {
      if (!lastCalledTime) lastCalledTime = time;
      const delta = time - lastCalledTime;

      if (delta > 50) {
        if (animateMultiplier()) {
          setMultiplier(
            parseFloat((((multiplier() + 0.01 - 2) % 98) + 2).toFixed(2))
          );
        }
        if (animateMod()) {
          setMod(parseFloat((((mod() + 0.05 - 1) % 199) + 1).toFixed(2)));
        }
      }
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
      // Draw outer circle
      ctx.beginPath();
      ctx.arc(0, 0, scaledRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw points
      for (let i = 0; i < mod(); i++) {
        const [xFactor, yFactor] = getCoord(i, mod(), scaledRadius);
        const x = xFactor;
        const y = yFactor;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2, true);
        ctx.fill();
      }

      // Draw labels
      if (showLabel()) {
        for (let i = 0; i < mod(); i += mod() > 100 ? 5 : mod() > 50 ? 2 : 1) {
          const [xFactor, yFactor] = getCoord(
            i,
            mod(),
            scaledRadius + 30 - (mod() / 200) * 12
          );

          const textX = xFactor;
          const textY = yFactor;

          ctx.save();
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          const fontsize = 24 - (mod() / 200) * 12;
          ctx.font = `${fontsize}px Arial`;
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

      const lineMap = new Map<number, Set<number>>();

      for (let i = 1; i <= mod(); i++) {
        let next = i * multiplier();
        while (next >= mod()) {
          next -= mod();
        }
        if (next === i) {
          continue;
        }
        const smaller = next < i ? next : i;
        const larger = next > i ? next : i;
        if (!lineMap.has(smaller)) {
          lineMap.set(smaller, new Set());
        }
        const lines = lineMap.get(smaller)!;
        lines.add(larger);
        lineMap.set(smaller, lines);
      }

      for (const [startIndex, endIndexes] of lineMap) {
        const initialCoord = getCoord(startIndex, mod(), scaledRadius);
        for (const endIndex of endIndexes) {
          ctx.moveTo(initialCoord[0], initialCoord[1]);
          const targetCoord = getCoord(endIndex, mod(), scaledRadius);
          ctx.lineTo(targetCoord[0], targetCoord[1]);
        }
      }
      ctx.stroke();
      requestId = requestAnimationFrame(draw);
    };
    requestId = requestAnimationFrame(draw);
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
          <div className="flex">
            <input
              className="flex-1"
              type="range"
              min={2}
              max={100}
              step={0.1}
              value={multiplier()}
              onChange={(e) => setMultiplier(parseFloat(e.target.value))}
            />
            <button
              className="w-1/3"
              onClick={() => setAnimateMultiplier(!animateMultiplier())}
            >
              {animateMultiplier() ? "Pause" : "Play"}
            </button>
          </div>
        </div>
        <div className="control-item">
          <label>Mod: {mod()}</label>
          <div className="flex">
            <input
              className="flex-1"
              type="range"
              min={1}
              max={200}
              step={0.1}
              value={mod()}
              onChange={(e) => setMod(parseFloat(e.target.value))}
            />
            <button
              className="w-1/3"
              onClick={() => setAnimateMod(!animateMod())}
            >
              {animateMod() ? "Pause" : "Play"}
            </button>
          </div>
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
