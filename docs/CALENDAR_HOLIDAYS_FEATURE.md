# Calendar Holiday Highlighting Feature

This document describes the holiday highlighting feature implemented for the shadcn/ui Calendar component.

## Features

### ✅ Core Features

1. **Holiday Dataset** (`lib/utils/holidays.ts`)
   - Structured holiday data with types: `national`, `state`, `custom`
   - Support for recurring holidays (month-day format)
   - Support for specific year holidays
   - Region-based filtering (e.g., state holidays)
   - Multiple holidays per date support

2. **Enhanced Calendar Component** (`components/ui/calendar-with-holidays.tsx`)
   - Holiday highlighting with distinct colors:
     - **National**: Blue background with blue border
     - **State**: Purple background with purple border
     - **Custom**: Amber background with amber border
   - Tooltip on hover showing holiday name(s)
   - Support for multiple holidays on the same date
   - Click handler for holiday dates
   - Toggle holiday visibility
   - Filter by holiday type

3. **Calendar Legend** (`components/ui/calendar-legend.tsx`)
   - Visual legend showing:
     - Holiday types (National, State, Custom)
     - Weekend indicator
     - Today indicator
   - Responsive design
   - Optional visibility controls

4. **Holiday Toggle Component** (`components/ui/calendar-holiday-toggle.tsx`)
   - Toggle holiday visibility on/off
   - Filter by holiday type (national, state, custom)
   - Dropdown menu interface
   - Accessible design

5. **API Support** (`app/api/holidays/route.ts`)
   - RESTful API endpoint for fetching holidays
   - Filter by year and region
   - Caching headers for performance
   - JSON response format

6. **JSON Configuration** (`public/holidays.json`)
   - Static holiday data file
   - Easy to extend and maintain
   - Supports all holiday types

## Usage

### Basic Usage

```tsx
import { CalendarWithHolidays } from "@/components/ui/calendar-with-holidays";

function MyComponent() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <CalendarWithHolidays
      mode="single"
      selected={date}
      onSelect={setDate}
      showHolidays={true}
    />
  );
}
```

### With Legend and Toggle

```tsx
import { CalendarWithHolidays } from "@/components/ui/calendar-with-holidays";
import { CalendarLegend } from "@/components/ui/calendar-legend";
import { CalendarHolidayToggle } from "@/components/ui/calendar-holiday-toggle";

function MyComponent() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showHolidays, setShowHolidays] = useState(true);
  const [holidayTypes, setHolidayTypes] = useState<HolidayType[]>([
    "national",
    "state",
    "custom",
  ]);

  return (
    <div>
      <CalendarHolidayToggle
        showHolidays={showHolidays}
        onShowHolidaysChange={setShowHolidays}
        holidayTypes={holidayTypes}
        onHolidayTypesChange={setHolidayTypes}
      />
      <CalendarWithHolidays
        mode="single"
        selected={date}
        onSelect={setDate}
        showHolidays={showHolidays}
        holidayTypes={holidayTypes}
      />
      <CalendarLegend showHolidays={showHolidays} />
    </div>
  );
}
```

### With Holiday Click Handler

```tsx
<CalendarWithHolidays
  mode="single"
  selected={date}
  onSelect={setDate}
  onHolidayClick={(date, holidays) => {
    console.log(`Holiday${holidays.length > 1 ? "s" : ""} on ${date}:`);
    holidays.forEach((h) => console.log(`- ${h.name} (${h.type})`));
  }}
/>
```

### Loading Holidays from API

```tsx
import { loadHolidaysFromAPI } from "@/lib/utils/holidays";
import { useEffect } from "react";

function MyComponent() {
  useEffect(() => {
    // Load holidays on component mount
    loadHolidaysFromAPI("/api/holidays?year=2025");
  }, []);

  return <CalendarWithHolidays />;
}
```

### Adding Custom Holidays

```tsx
import { addHoliday } from "@/lib/utils/holidays";

// Add a one-time custom holiday
addHoliday({
  date: "2025-12-31",
  name: "New Year's Eve",
  type: "custom",
  recurring: false,
  year: 2025,
});

// Add a recurring custom holiday
addHoliday({
  date: "12-31",
  name: "Company Holiday",
  type: "custom",
  recurring: true,
});
```

## Holiday Data Structure

```typescript
interface Holiday {
  date: string; // "YYYY-MM-DD" for specific dates, "MM-DD" for recurring
  name: string;
  type: "national" | "state" | "custom";
  region?: string; // For state holidays (e.g., "CA", "NY")
  recurring?: boolean; // If true, applies to all years
  year?: number; // Specific year if not recurring
}
```

## Color Scheme

- **National Holidays**: Blue (`bg-blue-100`, `border-blue-300`)
- **State Holidays**: Purple (`bg-purple-100`, `border-purple-300`)
- **Custom Holidays**: Amber (`bg-amber-100`, `border-amber-300`)

All colors support dark mode variants.

## API Endpoints

### GET `/api/holidays`

Fetch holidays with optional filters.

**Query Parameters:**
- `year` (optional): Filter by specific year
- `region` (optional): Filter by region (e.g., "CA")

**Example:**
```
GET /api/holidays?year=2025&region=CA
```

**Response:**
```json
{
  "holidays": [
    {
      "date": "01-01",
      "name": "New Year's Day",
      "type": "national",
      "recurring": true
    }
  ]
}
```

## Accessibility

- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ ARIA labels and roles
- ✅ High contrast colors
- ✅ Focus indicators
- ✅ Tooltip accessibility

## Responsive Design

- ✅ Mobile-friendly layout
- ✅ Touch-friendly interactions
- ✅ Responsive legend
- ✅ Adaptive tooltip positioning

## Extending the Feature

### Adding More Holidays

1. **Static Data**: Add to `lib/utils/holidays.ts` in the `holidays` array
2. **JSON File**: Add to `public/holidays.json`
3. **API**: Extend `/api/holidays/route.ts` to fetch from database

### Custom Holiday Types

To add new holiday types:

1. Update `HolidayType` in `lib/utils/holidays.ts`:
   ```typescript
   export type HolidayType = "national" | "state" | "custom" | "religious" | "regional";
   ```

2. Update color scheme in `calendar-with-holidays.tsx`:
   ```typescript
   if (hasReligious) {
     return "bg-green-100 dark:bg-green-900/30 border-green-300...";
   }
   ```

3. Update legend in `calendar-legend.tsx`:
   ```typescript
   {
     label: "Religious Holiday",
     color: "text-green-700 dark:text-green-300",
     bgColor: "bg-green-100 dark:bg-green-900/30",
     borderColor: "border-green-300 dark:border-green-700",
   }
   ```

## Demo Component

See `components/calendar/calendar-holiday-demo.tsx` for a complete example with all features enabled.

## Testing

1. **Visual Testing**: Check holiday highlighting on calendar
2. **Tooltip Testing**: Hover over holiday dates
3. **Toggle Testing**: Enable/disable holidays and types
4. **API Testing**: Load holidays from `/api/holidays`
5. **Accessibility Testing**: Use keyboard navigation and screen reader

## Performance

- Holiday data is cached per year
- Efficient date matching algorithms
- Minimal re-renders with React.useCallback
- API responses are cached with appropriate headers

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Future Enhancements

- [ ] International holiday support
- [ ] Holiday calendar import/export
- [ ] User-defined custom holidays (stored in database)
- [ ] Holiday notifications
- [ ] Holiday countdown
- [ ] Regional holiday presets
