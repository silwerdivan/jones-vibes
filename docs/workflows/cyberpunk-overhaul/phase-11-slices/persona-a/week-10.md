# Week 10: The Safe Grinder (Persona A) - Survival and Recovery

## Initial State (Start of Week 10)
- Credits: ₡380
- Hunger: 80% (Critical for TRAUMA_REBOOT)
- Sanity: 45
- Time: 16
- Location: Hab-Pod 404
- Active Conditions: TRAUMA_REBOOT (Max Energy reduced by 20%)

## Strategy
1. **Survival First**: Hunger is at the critical limit. Travel to Sustenance Hub would cost time and trigger Energy Drain failure.
2. **Local Shopping**: Purchase food at Hab-Pod 404 to avoid travel costs.
3. **Labor Loop**: Once hunger is stable, travel to Labor Sector and work Sanitation-T3 shifts.
4. **Efficiency**: Use all available time for work.

## Activity Log
| Action | Cost | Result | Stats Change |
| :--- | :--- | :--- | :--- |
| Attempt Travel to Sustenance Hub | 2CH | **FAIL** | Succumbed to Energy Drain (Time cost triggered failure) |
| **Restore Checkpoint (Week 9)** | N/A | Recovered to Week 10 start | Reset to ₡380 / Hunger 80% / Time 16 |
| Buy Real-Meat Burger (Hab-Pod) | ₡40 | Success (No time cost) | ₡340 / Hunger 30% / Sanity 55 / Time 16 |
| Travel to Labor Sector | 2CH | Success | ₡340 / Time 14 |
| Work Shift: Sanitation-T3 | 6CH | Success | ₡424 / Time 8 / Sanity 55 |
| Work Shift: Sanitation-T3 | 6CH | Success | ₡508 / Time 2 |
| Travel to Hab-Pod 404 | 2CH | Success | ₡508 / Time 0 |
| Rest / End Turn | N/A | Success | ₡428 / Hunger 50% / Sanity 50 |

## End State (Week 10 End)
- Credits: ₡428
- Hunger: 50%
- Sanity: 50
- Turn: 10 Completed (Moving to 11)
- Location: Hab-Pod 404
- TRAUMA_REBOOT: Active (242h remaining)

## Findings
- **Critical Discovery**: Buying food at Hab-Pod 404 uses the same inventory as Sustenance Hub but avoids the 2CH travel cost, which is lethal when at 80% hunger under TRAUMA_REBOOT.
- **Burn Rate**: Week 10 Burn Rate was ₡80.
- **AI Status**: AI Opponent (Persona B) appears to be struggling with low sanity and high debt.
