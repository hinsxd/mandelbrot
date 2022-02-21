import { PauseIcon, PlayIcon } from "@heroicons/react/solid";
import { StarIcon } from "@heroicons/react/outline";
import { GetStaticProps } from "next";
import { useEffect, useRef } from "react";
import { useGetSet, useMeasure } from "react-use";
const getCoord = (i: number, mod: number, radius: number): [number, number] => {
  const x = Math.cos((i * 2 * Math.PI) / mod) * radius;
  const y = -Math.sin((i * 2 * Math.PI) / mod) * radius;

  return [x, y];
};

const IndexPage = ({ stargazers }: { stargazers: number }) => {
  const [multiplier, setMultiplier] = useGetSet(3);
  const [mod, setMod] = useGetSet(50);

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

      if (delta > 10) {
        if (animateMultiplier()) {
          setMultiplier(
            parseFloat((((multiplier() + 0.01 - 1) % 199) + 1).toFixed(2))
          );
        }
        if (animateMod()) {
          setMod(parseFloat((((mod() + 0.02 - 1) % 199) + 1).toFixed(2)));
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

        const scaledRadius = (parseFloat(height) / 2 - 24) * ratio;
        canvas.width = +width * ratio;
        canvas.height = +height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.strokeStyle = "#eeeeee";
        ctx.fillStyle = "#eeeeee";
        ctx.lineWidth = ratio;
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
        for (let i = 0; i < mod(); i += mod() > 100 ? 5 : mod() > 50 ? 2 : 1) {
          const [xFactor, yFactor] = getCoord(
            i,
            mod(),
            scaledRadius + 14 * ratio
          );

          const textX = xFactor;
          const textY = yFactor;

          ctx.save();
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          const fontsize = 12 * ratio;
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

        const lineMap = new Map<number, number>();

        for (let i = 1; i <= mod(); i++) {
          let next = (i * multiplier()) % mod();
          if (next === i) {
            continue;
          }

          if (lineMap.get(next) === i) {
            continue;
          }
          lineMap.set(i, next);
        }

        for (const [startIndex, endIndex] of lineMap) {
          const initialCoord = getCoord(startIndex, mod(), scaledRadius);
          // console.log(startIndex,[...endIndexes]);
          ctx.moveTo(initialCoord[0], initialCoord[1]);
          const targetCoord = getCoord(endIndex, mod(), scaledRadius);
          ctx.lineTo(targetCoord[0], targetCoord[1]);
        }
        ctx.stroke();
        lastCalledTime = time;
      }
      requestId = requestAnimationFrame(draw);
    };
    requestId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, []);

  const [ref, { height, width }] = useMeasure<HTMLDivElement>();
  return (
    <div className="flex flex-col items-center p-2 space-y-4">
      <h1 className="text-3xl text-white font-bold">The MandelBrot</h1>
      <div className="flex space-x-2 flex-wrap">
        <div className="control-item">
          <label>
            Multiplier:{" "}
            <input
              className="text-black px-1 w-16"
              type="number"
              min={1}
              max={200}
              step={0.1}
              value={multiplier()}
              onChange={(e) => {
                setMultiplier(parseFloat(e.target.value));
              }}
            />
          </label>
          <div className="flex">
            <input
              className="flex-1"
              type="range"
              inputMode="decimal"
              min={1}
              max={200}
              step={0.1}
              value={multiplier()}
              onChange={(e) => setMultiplier(parseFloat(e.target.value))}
            />
            <button
              className="w-1/3"
              onClick={() => setAnimateMultiplier(!animateMultiplier())}
            >
              {animateMultiplier() ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <div className="control-item">
          <label>
            Mod:{" "}
            <input
              className="text-black px-1 w-16"
              type="number"
              inputMode="decimal"
              min={1}
              max={200}
              step={0.1}
              value={mod()}
              onChange={(e) => {
                setMod(parseFloat(e.target.value));
              }}
            />
          </label>
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
              {animateMod() ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div
        ref={ref}
        className="w-screen h-screen max-w-[700px] max-h-[700px]"
        style={{
          width: "100vw",
          height: "100vw",
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            height,
            width,
          }}
        />
      </div>
      <div className="flex items-center space-x-3">
        <a
          href="https://github.com/hinsxd/mandelbrot"
          rel="noreferrer noopener"
          target="_blank"
          className="flex rounded-md overflow-hidden text-gray-600 text-sm border border-gray-300 border-solid divide-x-[0.5px] divide-gray-300"
        >
          <span className="flex space-x-1 items-center bg-gray-200 px-2 py-1">
            <StarIcon className="h-4 w-4" />
            <span>Star</span>
          </span>
          <span className="flex space-x-1 items-center bg-white px-2 py-1">
            {123}
          </span>
        </a>
        <span className="text-gray-500 text-xs">
          Made with Tailwind CSS & Next.js
        </span>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps<{
  stargazers: number;
}> = async () => {
  const { stargazers_count } = await fetch(
    "https://api.github.com/repos/hinsxd/mandelbrot"
  ).then((r) => r.json());
  return {
    props: { stargazers: stargazers_count },
    revalidate: 60,
  };
};

export default IndexPage;
