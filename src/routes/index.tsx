import { For, createSignal, onMount, createMemo, Show } from "solid-js";
import { timePerceptionData } from "~/data";


const PerceiveLifeTracker = () => {
  const [age, setAge] = createSignal(5);
  const [hoveredAge, setHoveredAge] = createSignal<number | null>(null);
  const maxAge = 80;
  const minAge = 5;

  const handleMouseEnter = (rect: { age: number }, event: MouseEvent) => {
    setHoveredAge(rect.age);
  };

  const handleMouseMove = (event: MouseEvent) => {
    // No changes needed here
  };

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
      <div class="fixed bottom-8 left-0 right-0 bg-opacity-90 shadow-md z-50 flex items-center justify-between px-4 py-2">
        <div class="inline-block">
          <h2 class="text-2xl font-bold text-primary whitespace-nowrap">
            When you are <span class="text-accent">{age()}</span> years old
          </h2>
          <p class="text-xl text-secondary whitespace-nowrap">
            A year is <span class="font-bold text-accent">{(1 / age() * 100).toFixed(2)}%</span> of your life.
          </p>
        </div>
        <Show when={hoveredAge() !== null && hoveredAge() !== age()}>
          <div class="bg-white border border-gray-200 rounded p-2 shadow-md">
            Age {hoveredAge()}: {(1 / (hoveredAge() || 1) * 100).toFixed(2)}% of life
          </div>
        </Show>
      </div>

      <div class="fixed bottom-0 left-0 right-0 h-8 bg-white bg-opacity-90 shadow-md z-50 flex">
        <For each={yearRectangles()}>
          {(rect, index) => (
            <Show when={rect.visible}>
              <div
                class="h-full transition-all duration-300 ease-in-out relative"
                style={{
                  width: `${rect.width}%`,
                  "background-color": `hsl(${200 + (index() * 5)}, 70%, 50%)`,
                }}
                onMouseEnter={() => setHoveredAge(rect.age)}
                onMouseLeave={() => setHoveredAge(null)}
              >
                <Show when={rect.event || rect.age === age()}>
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1">
                    <div class={`text-white text-xs px-2 py-1 rounded ${rect.age === age() ? 'bg-primary' : 'bg-accent'}`}>
                      {rect.event ? rect.event.label : `Age ${rect.age}`}
                    </div>
                    <div class={`w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${rect.age === age() ? 'border-t-primary' : 'border-t-accent'} mx-auto`}></div>
                  </div>
                </Show>
              </div>
            </Show>
          )}
        </For>
      </div>
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
            <span class="time-icon text-2xl text-accent mr-3">⏳</span>
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