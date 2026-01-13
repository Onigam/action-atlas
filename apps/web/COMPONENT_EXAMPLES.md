# Component Examples - Neobrutalism Design System

Visual examples and code snippets for implementing Action Atlas components.

---

## Activity Card - Full Example

```tsx
import { MapPin, Clock, Award, Heart } from 'lucide-react';
import Image from 'next/image';

export function ActivityCard({ activity }) {
  return (
    <div className="
      border-3 border-black bg-white shadow-brutal
      transition-all duration-200
      hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-md
      overflow-hidden
      group
    ">
      {/* Cover Image */}
      <div className="relative h-48 bg-primary-100 border-b-3 border-black">
        <Image
          src={activity.coverImage}
          alt={activity.title}
          fill
          className="object-cover"
        />

        {/* Match Badge */}
        {activity.relevanceScore > 0.8 && (
          <div className="absolute top-4 right-4">
            <span className="
              inline-flex items-center
              border-2 border-black
              bg-success-400 text-black
              shadow-brutal-sm
              px-3 py-1.5
              text-xs font-bold uppercase tracking-wide
            ">
              High Match
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button className="
          absolute top-4 left-4
          w-10 h-10
          border-2 border-black
          bg-white
          shadow-brutal-sm
          transition-all
          hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal
          active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
        ">
          <Heart className="w-5 h-5 mx-auto" />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className="text-2xl font-bold leading-tight text-black line-clamp-2">
          {activity.title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-gray-700 line-clamp-2">
          {activity.description}
        </p>

        {/* Category Badge */}
        <div>
          <span className="
            inline-flex items-center
            border-2 border-black
            bg-secondary-300 text-black
            shadow-brutal-sm
            px-3 py-1
            text-xs font-bold uppercase tracking-wide
          ">
            {activity.category}
          </span>
        </div>

        {/* Meta Information */}
        <div className="space-y-2">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">
              {activity.location.city}, {activity.location.country}
            </span>
            {activity.distance && (
              <span className="text-xs text-gray-500">
                ({activity.distance} km away)
              </span>
            )}
          </div>

          {/* Time Commitment */}
          {activity.timeCommitment && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">
                {activity.timeCommitment.hoursPerWeek} hrs/week
              </span>
              {activity.timeCommitment.isFlexible && (
                <span className="text-xs text-gray-500">(flexible)</span>
              )}
            </div>
          )}

          {/* Skills */}
          {activity.skills?.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <Award className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {activity.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="
                      inline-block
                      border border-black
                      bg-gray-100
                      px-2 py-0.5
                      text-xs font-medium
                    "
                  >
                    {skill.name}
                  </span>
                ))}
                {activity.skills.length > 3 && (
                  <span className="text-xs font-medium text-gray-500">
                    +{activity.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button className="
          w-full h-11
          border-3 border-black
          bg-primary-500 text-black
          shadow-brutal
          font-bold uppercase tracking-wide text-sm
          transition-all
          hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md
          active:translate-x-1 active:translate-y-1 active:shadow-none
        ">
          View Details
        </button>
      </div>
    </div>
  );
}
```

---

## Search Bar - Full Example

```tsx
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  return (
    <div className="
      border-4 border-black
      bg-white
      shadow-brutal-lg
      p-3
    ">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="
            absolute left-4 top-1/2 -translate-y-1/2
            w-5 h-5
            text-gray-500
          " />
          <input
            type="text"
            placeholder="Search for volunteering activities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="
              w-full h-14
              border-3 border-black
              bg-white
              pl-12 pr-4 py-4
              text-base font-medium text-black
              shadow-brutal-sm
              transition-all
              placeholder:text-gray-500
              focus:outline-none focus:shadow-brutal focus:-translate-x-0.5 focus:-translate-y-0.5
            "
          />
        </div>

        {/* Location Input */}
        <div className="flex-1 relative">
          <MapPin className="
            absolute left-4 top-1/2 -translate-y-1/2
            w-5 h-5
            text-gray-500
          " />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="
              w-full h-14
              border-3 border-black
              bg-white
              pl-12 pr-4 py-4
              text-base font-medium text-black
              shadow-brutal-sm
              transition-all
              placeholder:text-gray-500
              focus:outline-none focus:shadow-brutal focus:-translate-x-0.5 focus:-translate-y-0.5
            "
          />
        </div>

        {/* Filter Button */}
        <button className="
          h-14 px-6
          border-3 border-black
          bg-secondary-400 text-black
          shadow-brutal
          font-bold uppercase tracking-wide text-sm
          transition-all
          hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md
          active:translate-x-1 active:translate-y-1 active:shadow-none
          flex items-center gap-2
          md:w-auto w-full justify-center
        ">
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filters</span>
        </button>

        {/* Search Button */}
        <button className="
          h-14 px-8
          border-3 border-black
          bg-primary-500 text-black
          shadow-brutal
          font-bold uppercase tracking-wide text-sm
          transition-all
          hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md
          active:translate-x-1 active:translate-y-1 active:shadow-none
          md:w-auto w-full
        ">
          Search
        </button>
      </div>
    </div>
  );
}
```

---

## Hero Section - Full Example

```tsx
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="
      relative
      bg-primary-100
      border-b-6 border-black
      py-24 md:py-32 lg:py-40
      overflow-hidden
    ">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dots opacity-10"></div>

      <div className="relative container-custom">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="
            inline-flex items-center gap-2
            border-2 border-black
            bg-secondary-300 text-black
            shadow-brutal-sm
            px-4 py-2
            text-sm font-bold uppercase tracking-wide
          ">
            <Sparkles className="w-4 h-4" />
            Find Your Purpose
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="
          text-5xl md:text-6xl lg:text-7xl xl:text-8xl
          font-extrabold
          leading-none
          tracking-tight
          text-black
          text-center
          mb-6
        ">
          Discover Volunteering
          <br />
          <span className="text-primary-600">Opportunities</span>
        </h1>

        {/* Subheading */}
        <p className="
          text-lg md:text-xl lg:text-2xl
          text-gray-800
          text-center
          max-w-3xl
          mx-auto
          mb-10
          leading-relaxed
        ">
          Use AI-powered semantic search to find the perfect volunteering
          activities that match your skills, interests, and availability.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="
            h-14 px-10
            border-3 border-black
            bg-primary-500 text-black
            shadow-brutal-lg
            font-bold uppercase tracking-wide text-base
            transition-all
            hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-xl
            active:translate-x-1 active:translate-y-1 active:shadow-none
            flex items-center gap-2
          ">
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button className="
            h-14 px-10
            border-3 border-black
            bg-white text-black
            shadow-brutal-lg
            font-bold uppercase tracking-wide text-base
            transition-all
            hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-xl
            active:translate-x-1 active:translate-y-1 active:shadow-none
          ">
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="
          grid grid-cols-1 md:grid-cols-3
          gap-6
          mt-16
          max-w-4xl
          mx-auto
        ">
          {/* Stat 1 */}
          <div className="
            border-3 border-black
            bg-white
            shadow-brutal
            p-6
            text-center
          ">
            <div className="text-4xl font-extrabold text-primary-600 mb-2">
              10K+
            </div>
            <div className="text-sm font-bold uppercase tracking-wide text-gray-700">
              Activities
            </div>
          </div>

          {/* Stat 2 */}
          <div className="
            border-3 border-black
            bg-white
            shadow-brutal
            p-6
            text-center
          ">
            <div className="text-4xl font-extrabold text-secondary-600 mb-2">
              500+
            </div>
            <div className="text-sm font-bold uppercase tracking-wide text-gray-700">
              Organizations
            </div>
          </div>

          {/* Stat 3 */}
          <div className="
            border-3 border-black
            bg-white
            shadow-brutal
            p-6
            text-center
          ">
            <div className="text-4xl font-extrabold text-accent-600 mb-2">
              50+
            </div>
            <div className="text-sm font-bold uppercase tracking-wide text-gray-700">
              Cities
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Filter Panel - Full Example

```tsx
import { X } from 'lucide-react';
import { useState } from 'react';

export function FilterPanel({ onClose }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const categories = [
    'Education',
    'Environment',
    'Healthcare',
    'Community',
    'Animals',
    'Arts & Culture',
  ];

  return (
    <div className="
      border-4 border-black
      bg-white
      shadow-brutal-lg
      p-6
      space-y-6
    ">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b-3 border-black">
        <h2 className="text-2xl font-bold text-black uppercase">
          Filters
        </h2>
        <button
          onClick={onClose}
          className="
            w-10 h-10
            border-2 border-black
            bg-gray-100
            shadow-brutal-sm
            transition-all
            hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal
            active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
          "
        >
          <X className="w-5 h-5 mx-auto" />
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-black">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => {
                  if (isSelected) {
                    setSelectedCategories(prev => prev.filter(c => c !== category));
                  } else {
                    setSelectedCategories(prev => [...prev, category]);
                  }
                }}
                className={`
                  inline-flex items-center
                  border-2 border-black
                  px-4 py-2
                  text-xs font-bold uppercase tracking-wide
                  shadow-brutal-sm
                  transition-all
                  hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal
                  active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                  ${isSelected
                    ? 'bg-primary-400 text-black'
                    : 'bg-white text-black'
                  }
                `}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Commitment */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-black">
          Time Commitment
        </h3>
        <div className="space-y-2">
          {['< 5 hrs/week', '5-10 hrs/week', '10-20 hrs/week', '20+ hrs/week'].map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="
                  w-5 h-5
                  border-3 border-black
                  shadow-brutal-sm
                  focus:ring-4 focus:ring-black focus:ring-offset-2
                  cursor-pointer
                "
              />
              <span className="text-base font-medium text-black group-hover:text-primary-600">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Distance */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-black">
          Distance
        </h3>
        <input
          type="range"
          min="0"
          max="100"
          className="w-full"
        />
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <span>0 km</span>
          <span>50 km</span>
          <span>100+ km</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t-3 border-black">
        <button className="
          flex-1 h-11
          border-3 border-black
          bg-white text-black
          shadow-brutal
          font-bold uppercase tracking-wide text-sm
          transition-all
          hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md
          active:translate-x-1 active:translate-y-1 active:shadow-none
        ">
          Reset
        </button>
        <button className="
          flex-1 h-11
          border-3 border-black
          bg-primary-500 text-black
          shadow-brutal
          font-bold uppercase tracking-wide text-sm
          transition-all
          hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md
          active:translate-x-1 active:translate-y-1 active:shadow-none
        ">
          Apply
        </button>
      </div>
    </div>
  );
}
```

---

## Navigation Header - Full Example

```tsx
import { Menu, Search, User, Heart } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="
      sticky top-0 z-50
      border-b-4 border-black
      bg-white
      shadow-brutal
    ">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="
              w-12 h-12
              border-3 border-black
              bg-primary-400
              shadow-brutal-sm
              transition-all
              group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-brutal
              flex items-center justify-center
            ">
              <span className="text-2xl font-black">A</span>
            </div>
            <span className="
              text-2xl font-extrabold
              text-black
              tracking-tight
            ">
              Action Atlas
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/activities"
              className="
                text-base font-bold
                text-black
                hover:text-primary-600
                transition-colors
              "
            >
              Activities
            </Link>
            <Link
              href="/organizations"
              className="
                text-base font-bold
                text-black
                hover:text-primary-600
                transition-colors
              "
            >
              Organizations
            </Link>
            <Link
              href="/about"
              className="
                text-base font-bold
                text-black
                hover:text-primary-600
                transition-colors
              "
            >
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button className="
              w-10 h-10
              border-2 border-black
              bg-white
              shadow-brutal-sm
              transition-all
              hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal
              active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
            ">
              <Search className="w-5 h-5 mx-auto" />
            </button>

            {/* Favorites Button */}
            <button className="
              w-10 h-10
              border-2 border-black
              bg-white
              shadow-brutal-sm
              transition-all
              hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal
              active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
            ">
              <Heart className="w-5 h-5 mx-auto" />
            </button>

            {/* Sign In Button (Desktop) */}
            <button className="
              hidden md:flex
              h-10 px-6
              border-3 border-black
              bg-primary-500 text-black
              shadow-brutal
              font-bold uppercase tracking-wide text-sm
              transition-all
              hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md
              active:translate-x-1 active:translate-y-1 active:shadow-none
              items-center gap-2
            ">
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            {/* Mobile Menu Button */}
            <button className="
              md:hidden
              w-10 h-10
              border-2 border-black
              bg-white
              shadow-brutal-sm
              transition-all
              hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal
              active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
            ">
              <Menu className="w-5 h-5 mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
```

---

## Footer - Full Example

```tsx
import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="
      border-t-4 border-black
      bg-gray-50
      py-12
    ">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="
              w-12 h-12
              border-3 border-black
              bg-primary-400
              shadow-brutal-sm
              flex items-center justify-center
            ">
              <span className="text-2xl font-black">A</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700">
              Discover volunteering opportunities through AI-powered semantic search.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              <a
                href="https://github.com"
                className="
                  w-10 h-10
                  border-2 border-black
                  bg-white
                  shadow-brutal-sm
                  transition-all
                  hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal
                  flex items-center justify-center
                "
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                className="
                  w-10 h-10
                  border-2 border-black
                  bg-white
                  shadow-brutal-sm
                  transition-all
                  hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal
                  flex items-center justify-center
                "
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                className="
                  w-10 h-10
                  border-2 border-black
                  bg-white
                  shadow-brutal-sm
                  transition-all
                  hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal
                  flex items-center justify-center
                "
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-black mb-4">
              Explore
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/activities" className="text-sm text-gray-700 hover:text-primary-600 font-medium">
                  All Activities
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="text-sm text-gray-700 hover:text-primary-600 font-medium">
                  Organizations
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-gray-700 hover:text-primary-600 font-medium">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/locations" className="text-sm text-gray-700 hover:text-primary-600 font-medium">
                  Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-black mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-700 hover:text-primary-600 font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-700 hover:text-primary-600 font-medium">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-700 hover:text-primary-600 font-medium">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-gray-700 hover:text-primary-600 font-medium">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-black mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Get weekly updates on new opportunities.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="
                  w-full h-10
                  border-2 border-black
                  bg-white
                  px-3 py-2
                  text-sm font-medium
                  shadow-brutal-sm
                  transition-all
                  placeholder:text-gray-500
                  focus:outline-none focus:shadow-brutal focus:-translate-x-0.5 focus:-translate-y-0.5
                "
              />
              <button className="
                w-full h-10
                border-2 border-black
                bg-primary-500 text-black
                shadow-brutal-sm
                font-bold uppercase tracking-wide text-xs
                transition-all
                hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal
                active:translate-x-1 active:translate-y-1 active:shadow-none
              ">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="
          pt-8
          border-t-2 border-black
          flex flex-col md:flex-row
          justify-between
          items-center
          gap-4
        ">
          <p className="text-sm font-medium text-gray-700">
            © 2026 Action Atlas. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm font-medium text-gray-700 hover:text-primary-600">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm font-medium text-gray-700 hover:text-primary-600">
              Terms
            </Link>
            <Link href="/cookies" className="text-sm font-medium text-gray-700 hover:text-primary-600">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## Responsive Grid Layout

```tsx
export function ActivityGrid({ activities }) {
  return (
    <div className="
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      gap-6
      lg:gap-8
    ">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
```

---

## Loading States

```tsx
// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="border-3 border-black bg-white shadow-brutal p-6 space-y-4">
      <div className="skeleton h-6 w-3/4"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-2/3"></div>
      <div className="skeleton h-10 w-full"></div>
    </div>
  );
}

// Button Loading
export function ButtonLoading() {
  return (
    <button
      disabled
      className="
        h-11 px-6 py-3
        border-3 border-black
        bg-gray-200 text-gray-500
        shadow-brutal
        font-bold uppercase tracking-wide text-sm
        cursor-not-allowed
        flex items-center gap-2
      "
    >
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>Loading...</span>
    </button>
  );
}
```

---

## Error States

```tsx
export function ErrorAlert({ message }) {
  return (
    <div className="
      border-3 border-black
      bg-destructive-100
      shadow-brutal
      p-6
      flex items-start gap-4
    ">
      <div className="
        w-10 h-10
        border-2 border-black
        bg-destructive-500
        shadow-brutal-sm
        flex items-center justify-center
        flex-shrink-0
      ">
        <span className="text-white text-xl font-bold">!</span>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-black mb-1">
          Error
        </h3>
        <p className="text-sm text-gray-800">
          {message}
        </p>
      </div>
    </div>
  );
}
```

---

These examples demonstrate the neobrutalism design system in action with real-world components for the Action Atlas platform.
