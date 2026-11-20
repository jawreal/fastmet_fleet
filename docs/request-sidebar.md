# Requests sidebar preview

The sidebar has one section per on-duty or on-trip vehicle. Each section shows
its vehicle, its assigned driver and its own ongoing request count. The visible
booking reference makes it easy to recognize a request that appears under
multiple vehicles of the same type.

`selectVehicleSections` builds and sorts the sections from the mock vehicles
and requests. `selectUniqueRequestCount` counts distinct request IDs across
those sections. The panel header, rail total, live region and global View all
control use that derived total. The rail's overflow chip counts additional
vehicle sections. Requests with no active vehicle of the matching type appear
in the existing off-duty nudge, counted once per request.

`RequestCard` renders request props and the Make offer stub. `RequestList`
orders the cards and handles Show more / Show less. A vehicle's disclosure
only toggles its request cards. The vehicle summary remains visible.
Make offer and Go on duty are mock actions. The global View all control opens
the expanded placeholder.

## Field mapping

| Preview field              | Source                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vehicle identity and plate | `FleetTruck.plate` serves both roles. The fleet model has no separate vehicle ID.                                                                             |
| Vehicle description        | `FleetTruck.model`, with the vehicle type name as fallback                                                                                                    |
| Driver                     | `FleetTruck.driverId` joins to `CrewMember.id`. The projection uses `id` and `name`. Crew has no photo field, so the UI uses initials.                        |
| Duty status                | `CrewMember.status` supplies On duty, On trip and Off duty. Truck status describes availability, trip or maintenance. The mock includes On trip as requested. |
| Vehicle type               | Client catalog `key`, `refCode` and `name`. Unverified codes stay unset and the tile uses the existing Fleet label.                                           |
| Request identity           | `Booking._id` maps to `id`. `Booking.bookingRef` is the visible reference.                                                                                    |
| Route and pickup time      | Formatted `pickUp`, `dropOff` and scheduled `bookingType.value`                                                                                               |
| Fare and distance          | `routeData.totalPrice` and `routeData.distance`                                                                                                               |
| Expiry                     | The inspected client model has no general request expiry, so preview expiry is synthetic.                                                                     |

## Try the mock scenarios

Run `pnpm dev:custom` and append `?scenario=` with one of these values to a
dashboard URL. `mixed` is the default. Production uses the mixed fixture and
omits the scenario selector and simulated arrival control.

| Scenario        | What to check                                                                               |
| --------------- | ------------------------------------------------------------------------------------------- |
| `mixed`         | Three vehicles with two, one and zero requests. The closed van is on trip.                  |
| `same-type`     | Two on-duty vehicles each show the same two booking references. The global total is two.    |
| `many-requests` | One vehicle has eight requests. Three appear initially, and Show 5 more reveals the rest.   |
| `no-driver`     | A vehicle explicitly marked On duty in the mock shows No driver assigned.                   |
| `none-on-duty`  | Three waiting requests appear in the off-duty nudge. The actionable total is zero.          |
| `empty`         | Empty rail and panel states.                                                                |
| `stress`        | Twelve vehicles and 120 unique requests. The rail shows three tiles and a +9 overflow chip. |

Use **Alt+Shift+Q** to open the panel or return to the rail. At widths below
1280px, the panel opens as a sheet. Below 768px, the sheet fills the viewport.
Use Tab to reach disclosure controls and the rail flyout, Enter or Space to
toggle a request list, and Escape to close the sheet and return focus to the
rail toggle. Refresh to verify the saved sidebar state.
