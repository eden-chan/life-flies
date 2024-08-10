import { For, createSignal, onMount, createMemo, Show } from "solid-js";
import { timePerceptionData } from "~/data";

const PerceiveLifeTracker = () => {
  const [age, setAge] = createSignal(5);
  const [hoveredAge, setHoveredAge] = createSignal<number | null>(null);
  const [showInfoBox, setShowInfoBox] = createSignal(true);
  const maxAge = 80;
  const minAge = 5;

  const handleMouseEnter = (rect: { age: number }, event: MouseEvent) => {
    setHoveredAge(rect.age);
    updateCursorPosition(event);
  };

  const handleMouseMove = (event: MouseEvent) => {
    updateCursorPosition(event);
  };

  const handleMouseLeave = () => {
    setHoveredAge(null);
    setCursorPosition({ x: 0, y: 0 });
  };

  const updateCursorPosition = (event: MouseEvent) => {
    setCursorPosition({ x: event.clientX, y: event.clientY });
  };

  const [cursorPosition, setCursorPosition] = createSignal({ x: 0, y: 0 });

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPercentage = scrollPosition / (documentHeight - windowHeight);

    const newAge = Math.max(minAge, Math.min(Math.floor(scrollPercentage * maxAge), maxAge));
    setAge(newAge);
  };

  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const lifeEvents = [
    { age: 18, label: "Adulthood" },
    { age: 40, label: "Half-life" },
    { age: 65, label: "Retirement" },
  ];

  const yearRectangles = createMemo(() => {
    const currentAge = age();
    const rectangles = [];
    let totalWidth = 0;

    for (let i = minAge; i <= maxAge; i++) {
      const width = 1 / i * 100;
      totalWidth += width;
      rectangles.push({
        age: i,
        width,
        event: lifeEvents.find(event => event.age === i),
        visible: i <= currentAge
      });
    }

    const normalizedRectangles = rectangles.map(rect => ({
      ...rect,
      width: (rect.width / totalWidth) * 100
    }));

    return normalizedRectangles;
  });

  return (
    <>
      <button
        class="fixed top-4 right-4 bg-white hover:bg-gray-100 bg-opacity-90 shadow-md z-50 p-2 rounded-full cursor-pointer transition-colors duration-200 ease-in-out"
        onClick={() => setShowInfoBox(!showInfoBox())}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600 hover:text-gray-800 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d={showInfoBox() ? "M6 18L18 6M6 6l12 12" : "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}
            class="hover:text-gray-800 cursor-pointer transition-colors duration-200 ease-in-out"
          />
        </svg>
      </button>

      <Show when={showInfoBox()}>
        <div class="fixed top-16 right-4 bg-white bg-opacity-90 shadow-md z-50 p-4 rounded-lg max-w-md">
          <h3 class="text-lg font-bold text-primary mb-2">Assumptions & Inspiration</h3>
          <ul class="list-disc list-inside text-sm text-secondary">
            <li>Lifespan till 80</li>
            <li>First five years of life don't affect time dilation (<a href="https://en.wikipedia.org/wiki/Childhood_amnesia" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">childhood amnesia</a>)</li>
            <li>Time dilation occurs at 1/X where X is increasing age</li>
          </ul>
          <p class="text-xs text-gray-500 mt-2">
            Inspired by Sam Altman's tweet: "From a psychologist friend: 'Adjusted for the subjective increase in how fast time passes, life is half over by 23 or 24. Don't waste time.'"
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Source: <a href="https://twitter.com/sama/status/1620593806014590976" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">Twitter</a>
          </p>
          <p class="text-xs text-gray-500 mt-2">
            Design inspiration: <a href="https://www.maximiliankiener.com/digitalprojects/time/" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">Maximilian Kiener's Time Project</a>
          </p>
        </div>
      </Show>

      <div class="fixed top-4 left-12 right-0 z-20 flex items-center px-4 py-2">
        <div class="inline-block bg-white rounded-lg p-2">
          <h2 class="text-xl font-bold text-primary whitespace-nowrap">
            When you are <span class="text-accent">{age()}</span> years old
          </h2>
          <p class="text-lg text-secondary whitespace-nowrap">
            A year is <span class="font-bold text-accent">{(1 / age() * 100).toFixed(2)}%</span> of your life.
          </p>
        </div>
      </div>

      <div class="fixed top-0 left-0 bottom-0 w-8 bg-white bg-opacity-90 shadow-md z-50 flex flex-col">
        <For each={yearRectangles()}>
          {(rect, index) => (
            <div
              class="w-full transition-all duration-300 ease-in-out relative border-t border-gray-200 last:border-b"
              style={{
                height: `${rect.width}%`,
                "background-color": rect.visible ? `hsl(${200 + (index() * 5)}, 70%, 50%)` : 'transparent',
              }}
              onMouseEnter={(e) => handleMouseEnter(rect, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <Show when={rect.event || rect.age === age() || hoveredAge() === rect.age}>
                <div class="absolute left-full top-1/2 transform -translate-y-1/2 ml-1">
                  <div class={`text-white text-xs px-2 py-1 rounded ${rect.age === age() ? 'bg-primary' : 'bg-accent'}`}>
                    {rect.event ? rect.event.label : `Age ${rect.age}`}
                  </div>
                  <div class={`w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent ${rect.age === age() ? 'border-r-primary' : 'border-r-accent'} absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full`}></div>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>

      <Show when={hoveredAge() !== null && hoveredAge() !== age()}>
        <div
          class="fixed bg-white border border-gray-200 rounded p-2 shadow-md z-50 pointer-events-none"
          style={{
            left: `${cursorPosition().x + 20}px`,
            top: `${cursorPosition().y}px`,
          }}
        >
          Age {hoveredAge()}: {(1 / (hoveredAge() || 1) * 100).toFixed(2)}% of life
        </div>
      </Show>
    </>
  );
};

const ScrollingContent = () => {
  const [visibleItems, setVisibleItems] = createSignal<number[]>([]);

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.id.split('-')[1]);
            setVisibleItems((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    timePerceptionData.forEach((_, index: number) => {
      const element = document.getElementById(`item-${index}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  });

  return (
    <div class="scrolling-content max-w-3xl mx-auto px-4 py-10">
      <For each={timePerceptionData}>
        {(item, index) => (
          <div
            id={`item-${index()}`}
            class={`content-item bg-white p-6 rounded-lg shadow-md mb-8 transition-all duration-500 ease-in-out ${visibleItems().includes(index()) ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`}
          >
            <span class="text-lg text-secondary">{item}</span>
          </div>
        )}
      </For>
    </div>
  );
};

export default function Home() {
  return (
    <div class="bg-background min-h-screen pb-16">
      <PerceiveLifeTracker />
      <ScrollingContent />
    </div>
  );
}