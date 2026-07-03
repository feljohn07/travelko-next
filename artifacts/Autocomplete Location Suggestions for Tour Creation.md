# Autocomplete Location Suggestions for Tour Creation

Add autocomplete location suggestions to the "Address / Destination" input field when creating or editing tour packages. Selecting a suggestion will automatically update the latitude and longitude fields.

## Proposed Changes

### Coordinator Tours

#### [MODIFY] [page.jsx](file:///c:/Users/user/Desktop/Coding%20Projects/travelko-next/src/app/%28coordinator%29/coordinator/tours/page.jsx)

- Add React state variables for managing suggestions:
  - `suggestions`: stores the array of location suggestions fetched from the API.
  - `suggestionsLoading`: boolean flag indicating that an API fetch is in progress.
  - `showSuggestions`: boolean flag controlling dropdown visibility.
  - `userSelected`: boolean flag used to bypass API fetching immediately after selecting a location.
- Implement a click-outside listener via a `useRef` to dismiss the suggestions dropdown when clicking elsewhere.
- Add a formatted address builder utility to combine fields like `name`, `street`, `locality`, `city`, `state`, and `country` cleanly.
- Add a debounced `useEffect` that listens to changes in `form.address`:
  - When the user types, it waits 400ms before requesting suggestions from `/location/suggestions?place=<query>`.
  - Filters out any `null` or invalid response elements.
- Replace the static "Address / Destination" input field with a search input including:
  - Loading spinner indicator.
  - Dropdown suggestion list displaying place names, details/formatted address, and location type (e.g. city, district, village, etc.).
- Update input click/focus handlers to show existing suggestions.
- Update selection handler:
  - Updates `form.address` with the fully formatted address.
  - Updates `form.latitude` and `form.longitude` with the selected coordinates.

## Verification Plan

### Manual Verification
- Run `npm run dev` and navigate to the coordinator tours page.
- Open the Create Tour or Edit Tour modal.
- Type a place name in the "Address / Destination" field (e.g. "Butuan").
- Verify that a loading indicator appears and suggestions list is displayed.
- Verify that clicking a suggestion:
  - Fills the Address input with the complete formatted address.
  - Fills Latitude and Longitude inputs with the correct numeric values.
  - Closes the suggestions dropdown.
- Verify that typing again updates the suggestions list.
- Verify that clicking outside the suggestions dropdown closes it.
