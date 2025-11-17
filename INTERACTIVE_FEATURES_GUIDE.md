# Interactive Features & Animations Guide

**Created**: November 16, 2025
**Version**: 1.0.0
**Tech Stack**: Framer Motion + React Player + React CountUp

---

## Overview

This guide documents the interactive features and animations added to the OpEx Business Transformation landing page, creating an engaging, modern user experience inspired by enterprise platforms like SAP Signavio.

---

## 🎬 Features Added

### 1. **Video Embedding** (`VideoSection.tsx`)

Professional video showcase with YouTube/Vimeo support and custom thumbnails.

**Features**:
- Responsive 16:9 aspect ratio
- Custom thumbnail support
- Autoplay option
- Smooth fade-in animation
- Hover scale effect
- YouTube player configuration

**Usage**:
```tsx
import { VideoSection } from '@/components/VideoSection';

<VideoSection
  title="See OpEx in Action"
  description="Watch how organizations are transforming processes"
  videoUrl="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
  thumbnail="/images/video-thumbnail.jpg"
  autoplay={false}
  controls={true}
/>
```

**Props**:
- `title` (string) - Section title
- `description` (string, optional) - Subtitle text
- `videoUrl` (string) - YouTube, Vimeo, or direct video URL
- `thumbnail` (string, optional) - Custom thumbnail image path
- `autoplay` (boolean, default: false) - Auto-start video
- `controls` (boolean, default: true) - Show player controls

**Animation Details**:
- Fade in on scroll (viewport trigger)
- Scale up from 0.95 to 1.0
- Hover: Scale to 1.02
- Duration: 0.6s with easing

---

### 2. **Animated Statistics Counter** (`AnimatedStats.tsx`)

Eye-catching animated counters that count up from zero when scrolled into view.

**Features**:
- CountUp animation from 0 to target value
- Intersection Observer for viewport detection
- Staggered animation (0.2s delay between cards)
- Icon support
- Prefix/suffix support (%, $, etc.)
- Decimal precision control
- Hover lift effect

**Usage**:
```tsx
import { AnimatedStats } from '@/components/AnimatedStats';

<AnimatedStats
  stats={[
    { value: 60, suffix: '%', label: 'Time Savings', icon: '⏱️' },
    { value: 80, suffix: '%', label: 'Error Reduction', icon: '✓' },
    { value: 420, suffix: '%', label: 'Average ROI', icon: '📈' },
    { value: 2.2, decimals: 1, label: 'Months to Payback', icon: '💰' },
  ]}
/>
```

**Stat Object Structure**:
```typescript
interface Stat {
  value: number;           // The number to count to
  label: string;           // Description text
  suffix?: string;         // Text after number (e.g., '%')
  prefix?: string;         // Text before number (e.g., '$')
  decimals?: number;       // Decimal places (default: 0)
  icon?: string;           // Emoji or icon
}
```

**Animation Details**:
- Count duration: 2.5 seconds
- Stagger delay: 0.2s between stats
- Entry animation: Slide up 30px with fade
- Hover: Lift 8px with shadow enhancement

---

### 3. **Interactive ROI Calculator** (`ROICalculator.tsx`)

Fully functional ROI calculator with real-time updates and expandable interface.

**Features**:
- Expandable/collapsible design
- 5 input sliders with real-time updates
- Automatic calculations (monthly, annual, ROI %, payback period)
- Breakdown section showing calculation details
- Animated result cards with stagger effect
- Responsive two-column layout (inputs | results)

**Calculations**:
```typescript
Monthly Manual Cost = numProcesses × avgManualHours × hourlyRate
Monthly Error Cost = numProcesses × (errorRate / 100) × avgErrorCost
Automation Savings = Monthly Manual Cost × 60%
Error Reduction = Monthly Error Cost × 80%
Total Monthly Savings = Automation Savings + Error Reduction
Annual Savings = Total Monthly Savings × 12
ROI = ((Annual Savings - Platform Cost) / Platform Cost) × 100
Payback Period = Platform Cost / Total Monthly Savings
```

**Customization**:
```tsx
// Update platform cost in ROICalculator.tsx
const platformCost = 3000; // Annual cost in USD

// Update automation percentage
const automationSavings = monthlyManualCost * 0.6; // 60% automation

// Update error reduction
const errorReduction = monthlyErrorCost * 0.8; // 80% fewer errors
```

**Input Ranges**:
- Number of processes: 1-100
- Manual hours per process: 1-100
- Hourly rate: $10-$200
- Error rate: 0-20%
- Cost per error: $100-$5,000

---

### 4. **Interactive Process Flow** (`InteractiveProcessFlow.tsx`)

Clickable 5-stage process timeline with expandable details.

**Features**:
- Visual timeline with connected nodes
- Click to expand step details
- Smooth height animations
- Key activities list
- Tools & methods badges
- Duration indicators
- Mobile-responsive (nodes wrap on small screens)

**Process Steps**:
1. **Discover** - Map current processes (2-4 weeks)
2. **Analyze** - Identify improvements (1-2 weeks)
3. **Design** - Create optimized models (2-3 weeks)
4. **Implement** - Deploy automation (3-6 weeks)
5. **Monitor** - Track & improve (Ongoing)

**Customization**:
```tsx
// Add/modify steps in InteractiveProcessFlow.tsx
const processSteps: ProcessStep[] = [
  {
    id: 1,
    title: 'Your Step',
    description: 'Short description',
    icon: '🔍',
    details: ['Activity 1', 'Activity 2'],
    tools: ['Tool 1', 'Tool 2'],
    duration: '2 weeks',
  },
  // ... more steps
];
```

**Animation Details**:
- Node entrance: Scale from 0.5 to 1.0
- Connector: Width animation from 0 to 100%
- Details card: Height from 0 to auto with fade
- Stagger delay: 0.1s between nodes
- Hover: Scale to 1.1 with shadow

---

### 5. **Testimonial Carousel** (`TestimonialCarousel.tsx`)

Auto-playing carousel with manual navigation and statistics.

**Features**:
- Auto-advance every 8 seconds
- Manual navigation (previous/next buttons)
- Dot navigation (jump to specific slide)
- Swipe animation between slides
- Statistics card for each testimonial
- Responsive design
- Pause on hover (optional)

**Testimonial Structure**:
```typescript
interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  organization: string;
  avatar?: string;
  stats?: {
    label: string;
    value: string;
  };
}
```

**Adding Testimonials**:
```tsx
// In TestimonialCarousel.tsx
const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: 'Your testimonial text here...',
    author: 'John Doe',
    role: 'CTO',
    organization: 'Company Name',
    stats: {
      label: 'Time Saved',
      value: '40+ hrs/mo',
    },
  },
  // ... more testimonials
];
```

**Animation Details**:
- Slide transition: Spring physics (stiffness: 300, damping: 30)
- Direction-aware enter/exit animations
- Fade duration: 0.2s
- Auto-advance: 8 seconds per slide
- Hover: Scale buttons to 1.1

---

## 📦 Dependencies

### Installed Packages

```json
{
  "framer-motion": "^12.23.24",
  "react-player": "^3.4.0",
  "react-countup": "^6.5.3",
  "react-intersection-observer": "^10.0.0"
}
```

### Installation

```bash
pnpm add framer-motion react-player react-countup react-intersection-observer
```

---

## 🎨 Animation Patterns

### Scroll-Triggered Animations

All major sections use Framer Motion's `whileInView` for smooth scroll animations:

```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.div>
```

**Parameters**:
- `initial`: Starting state
- `whileInView`: Target state when in viewport
- `viewport.once`: Only animate once (prevent re-trigger)
- `viewport.amount`: How much element must be visible (0.3 = 30%)
- `transition.duration`: Animation length in seconds

### Staggered Children

Used for grids and lists:

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Delay between each child
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};
```

### Hover Effects

Consistent hover states across components:

```tsx
<motion.div
  whileHover={{ scale: 1.05, y: -4 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
/>
```

---

## 🎯 Performance Optimization

### Code Splitting

All interactive components are dynamically imported:

```tsx
// In pages/transformation.tsx
import { VideoSection } from '@/components/VideoSection';
// Components are automatically code-split by Next.js
```

### Lazy Loading

Videos and heavy animations only load when needed:

```tsx
// React Player lazy loads YouTube iframe
<ReactPlayer
  light={thumbnail} // Shows thumbnail first
  playing={autoplay}
/>
```

### Animation Performance

- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` for complex animations (automatically handled by Framer Motion)
- Disable animations on low-end devices (optional):

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  animate={prefersReducedMotion ? {} : { y: 0, opacity: 1 }}
/>
```

---

## 📱 Responsive Behavior

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  /* Single column layouts */
  /* Reduced animation complexity */
}

/* Tablet */
@media (min-width: 769px) and (max-width: 968px) {
  /* 2-column layouts */
}

/* Desktop */
@media (min-width: 969px) {
  /* Full 3-column layouts */
  /* Complex animations */
}
```

### Mobile Optimizations

- **ROI Calculator**: Stacks inputs and results vertically
- **Process Flow**: Nodes wrap and connectors hide
- **Testimonial Carousel**: Navigation buttons move to sides
- **Video Section**: Full-width player
- **Animated Stats**: Single column grid

---

## ♿ Accessibility

### Keyboard Navigation

All interactive elements are keyboard accessible:

```tsx
// Carousel navigation
<button
  onClick={goToNext}
  aria-label="Next testimonial"
  onKeyDown={(e) => e.key === 'Enter' && goToNext()}
>
  ›
</button>
```

### Screen Reader Support

- **ARIA labels** on all buttons
- **Semantic HTML** structure
- **Focus indicators** visible on all interactive elements
- **Alternative text** for visual content

### Motion Preferences

Respect user's motion preferences:

```tsx
const { matches: prefersReducedMotion } = useMediaQuery(
  '(prefers-reduced-motion: reduce)'
);

const variants = prefersReducedMotion
  ? { /* Static */ }
  : { /* Animated */ };
```

---

## 🔧 Customization Guide

### Changing Animation Speed

```tsx
// Global speed adjustment in each component
transition={{ duration: 0.6 }} // Slower: 0.8, Faster: 0.4
```

### Modifying Colors

All components use CSS Modules with design tokens:

```css
/* In component.module.css */
.componentCard {
  border-color: var(--sap-primary); /* #0854A0 */
  background: var(--sap-background-surface);
}
```

Update tokens in `styles/design-tokens.css`:

```css
:root {
  --sap-primary: #YOUR_COLOR;
}
```

### Adding New Stats

```tsx
<AnimatedStats
  stats={[
    // Existing stats...
    { value: 95, suffix: '%', label: 'Customer Satisfaction', icon: '😊' },
  ]}
/>
```

### Customizing ROI Formula

Edit calculations in `ROICalculator.tsx`:

```tsx
// Change automation percentage
const automationSavings = monthlyManualCost * 0.75; // 75% instead of 60%

// Change platform cost
const platformCost = 5000; // $5000 annually
```

---

## 🐛 Troubleshooting

### Issue: Animations not working

**Solution**: Ensure Framer Motion is installed:
```bash
pnpm install framer-motion
```

Check for client-side rendering:
```tsx
'use client'; // Add at top of component file
```

### Issue: Video not loading

**Solution**:
1. Check video URL is valid
2. Verify React Player supports the format
3. Check CORS settings if self-hosted

### Issue: CountUp not animating

**Solution**: Ensure component is in viewport:
```tsx
// Check Intersection Observer is triggered
const { ref, inView } = useInView({ threshold: 0.3 });
```

### Issue: Hydration errors

**Solution**: Use dynamic imports for client-only components:
```tsx
import dynamic from 'next/dynamic';

const VideoSection = dynamic(() => import('@/components/VideoSection'), {
  ssr: false
});
```

---

## 📊 Performance Metrics

### Target Scores

- **Lighthouse Performance**: 90+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

### Optimization Checklist

- [x] Code splitting for components
- [x] Lazy loading for videos
- [x] GPU-accelerated animations
- [x] Responsive images
- [x] Minimal bundle size
- [ ] Add loading skeletons (future enhancement)
- [ ] Implement service worker (future enhancement)

---

## 🚀 Future Enhancements

### Phase 2 (Next Month)

- [ ] Add loading skeletons for async content
- [ ] Implement pause-on-hover for carousel
- [ ] Add progress bar for video player
- [ ] Create animated tooltips
- [ ] Add particle effects on hero section

### Phase 3 (Quarter 2)

- [ ] 3D card flip animations
- [ ] Parallax scrolling effects
- [ ] Interactive process simulator
- [ ] Animated SVG illustrations
- [ ] Lottie animation integration

---

## 📚 Additional Resources

### Framer Motion

- **Docs**: https://www.framer.com/motion/
- **Examples**: https://www.framer.com/motion/examples/
- **Animation Library**: https://www.framer.com/motion/animation/

### React Player

- **Docs**: https://github.com/cookpete/react-player
- **Supported Players**: YouTube, Vimeo, Dailymotion, SoundCloud, etc.

### React CountUp

- **Docs**: https://github.com/glennreyes/react-countup
- **Demo**: https://react-countup.netlify.app

### Intersection Observer

- **Docs**: https://github.com/thebuilder/react-intersection-observer
- **MDN**: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

---

## 🎓 Best Practices

### Animation Do's

✅ **Do**:
- Keep animations under 0.5s for micro-interactions
- Use easing functions for natural motion
- Provide feedback on user actions
- Test on low-end devices
- Respect `prefers-reduced-motion`

### Animation Don'ts

❌ **Don't**:
- Animate `width`, `height`, `top`, `left` (use `transform` instead)
- Create animations longer than 1s
- Animate on every scroll event (use Intersection Observer)
- Block user interaction during animations
- Forget to test mobile performance

---

## 📞 Support

**Questions?**
- Check component documentation above
- Review Framer Motion docs
- Test in isolation before integrating
- Use browser DevTools Performance tab

**Issues?**
- Check console for errors
- Verify all dependencies installed
- Test in different browsers
- Review CSS Module imports

---

**Version**: 1.0.0
**Last Updated**: November 16, 2025
**Maintainer**: OpEx Platform Team
**License**: MIT

---

**Remember**: Animations should enhance, not distract. Keep them purposeful, smooth, and performant!
