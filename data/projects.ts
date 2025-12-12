import type { Project } from '~/types/projects';

export const projects: Project[] = [
  {
    slug: 'traffic-simulator',
    title: 'Traffic Simulator',
    summary:
      'Animate a side-scrolling, two-lane street where autonomous cars obey a changing traffic light and keep traffic flowing without collisions.',
    instructions:
      'Keep the scenario readable on mobile, avoid external dependencies, and surface a clear stop line so every model output is easy to review at a glance.',
    models: [
      {
        id: 'reference',
        name: 'Reference Build',
        description:
          'Baseline simulation with a paired stoplight cycle, light-controlled flow, and responsive spacing so cars never touch.',
        path: '/projects/traffic-simulator/reference/index.html'
      },
      {
        id: 'custom',
        name: 'Custom Implementation',
        description:
          'Enhanced traffic simulator with three lanes, gradient styling, real-time stats display, and smooth easing animations.',
        path: '/projects/traffic-simulator/custom/index.html'
      },
      {
        id: 'gpt-5.2',
        name: 'gpt-5.2 Implementation',
        description:
          'Two-lane, stopline-first simulation with smooth easing, hard safety clamps, and a compact stats header.',
        path: '/projects/traffic-simulator/gpt-5.2/traffic-simulator-gpt-5.2.html'
      }
    ],
    tasks: [
      {
        id: 'traffic-overview',
        title: 'Sketch the street and flow',
        summary:
          'Render a two-lane road where cars move left-to-right and a single mast traffic light governs both lanes.',
        details: [
          'Show a visible stop line and a mast-mounted light that cycles through green, yellow, and red.',
          'Spawn a steady stream of cars in both lanes with varied spacing so traffic occasionally builds up.',
          'Ensure the layout looks crisp on desktop and collapses cleanly on mobile without breaking the scene.'
        ]
      },
      {
        id: 'safety-logic',
        title: 'Make traffic responsive',
        summary:
          'Cars must anticipate the light and each other, queue safely, and accelerate smoothly when the light allows.',
        details: [
          'Cars stop at the line on red, slow during yellow if they are near, and hold a safe gap behind any vehicle ahead.',
          'Prevent collisions entirely; when space is tight, vehicles should idle rather than overlap or jitter.',
          'Keep the motion fluid with easing-style acceleration so departures look intentional and never abrupt.'
        ]
      },
      {
        id: 'experience-pass',
        title: 'Polish the simulator output',
        summary:
          'Add readable overlays and micro-interactions that communicate system state without distracting from the flow.',
        details: [
          'Display the current light phase, elapsed time, and queue length hints without requiring user interaction.',
          'Use color, glow, and shadow treatments that feel modern while maintaining high contrast for quick reviews.',
          'Keep everything self-contained in a single HTML file so it can drop into the viewer without extra build steps.'
        ]
      }
    ]
  }
];
