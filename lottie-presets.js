// =============================================================
// Sports Broadcast Lottie Animation Presets
// Bodymovin / Lottie Vector Motion Graphics Engine
// =============================================================

const LOTTIE_PRESETS = {
  velocity_crimson: {
    id: 'velocity_crimson',
    name: 'Velocity Crimson (Kinetic Slat)',
    category: 'Lower Third',
    description: 'High-octane angled sports bar with animated metallic sweep and jersey shield',
    data: {
      v: "5.7.4",
      fr: 60,
      ip: 0,
      op: 180,
      w: 960,
      h: 200,
      nm: "Velocity_Crimson_LowerThird",
      ddd: 0,
      assets: [],
      layers: [
        // 1. Shimmer Sheen Light Sweep (animated sliding white gradient flare)
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: "Shimmer_Sheen",
          sr: 1,
          ks: {
            o: {
              a: 1,
              k: [
                { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 20, s: [0] },
                { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 40, s: [45] },
                { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 75, s: [0] },
                { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 110, s: [0] },
                { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 130, s: [40] },
                { t: 160, s: [0] }
              ]
            },
            r: { a: 0, k: -25 },
            p: {
              a: 1,
              k: [
                { i: { x: 0.2, y: 1 }, o: { x: 0.2, y: 0 }, t: 20, s: [-100, 100, 0] },
                { i: { x: 0.2, y: 1 }, o: { x: 0.2, y: 0 }, t: 75, s: [1050, 100, 0] },
                { i: { x: 0.2, y: 1 }, o: { x: 0.2, y: 0 }, t: 110, s: [-100, 100, 0] },
                { t: 160, s: [1050, 100, 0] }
              ]
            },
            a: { a: 0, k: [0, 0, 0] },
            s: { a: 0, k: [100, 100, 100] }
          },
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "rc",
                  d: 1,
                  s: { a: 0, k: [40, 240] },
                  p: { a: 0, k: [0, 0] },
                  r: { a: 0, k: 0 },
                  nm: "Sheen_Bar"
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [1, 1, 1, 1] },
                  o: { a: 0, k: 80 },
                  r: 1,
                  nm: "Sheen_Fill"
                },
                {
                  ty: "tr",
                  p: { a: 0, k: [0, 0] },
                  a: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [100, 100] },
                  r: { a: 0, k: 0 },
                  o: { a: 0, k: 100 }
                }
              ]
            }
          ]
        },
        // 2. Animated Accent Stripe (Kinetic bottom bar)
        {
          ddd: 0,
          ind: 2,
          ty: 4,
          nm: "Accent_Stripe",
          sr: 1,
          ks: {
            o: { a: 0, k: 100 },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [480, 185, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: {
              a: 1,
              k: [
                { i: { x: [0.16, 0.16, 0.16], y: [1, 1, 1] }, o: { x: [0.16, 0.16, 0.16], y: [0, 0, 0] }, t: 0, s: [0, 100, 100] },
                { i: { x: [0.83, 0.83, 0.83], y: [1, 1, 1] }, o: { x: [0.16, 0.16, 0.16], y: [0, 0, 0] }, t: 25, s: [100, 100, 100] },
                { t: 180, s: [100, 100, 100] }
              ]
            }
          },
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "rc",
                  d: 1,
                  s: { a: 0, k: [920, 6] },
                  p: { a: 0, k: [0, 0] },
                  r: { a: 0, k: 3 },
                  nm: "Stripe_Rect"
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [0.88, 0.02, 0, 1] }, // Crimson accent #e10600
                  o: { a: 0, k: 100 },
                  r: 1,
                  nm: "Stripe_Fill"
                },
                {
                  ty: "tr",
                  p: { a: 0, k: [0, 0] },
                  a: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [100, 100] },
                  r: { a: 0, k: 0 },
                  o: { a: 0, k: 100 }
                }
              ]
            }
          ]
        },
        // 3. Main Dark Backplate with angled expansion
        {
          ddd: 0,
          ind: 3,
          ty: 4,
          nm: "Main_Backplate",
          sr: 1,
          ks: {
            o: {
              a: 1,
              k: [
                { i: { x: [0.2], y: [1] }, o: { x: [0.2], y: [0] }, t: 0, s: [0] },
                { t: 15, s: [100] }
              ]
            },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [480, 100, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: {
              a: 1,
              k: [
                { i: { x: [0.16, 0.16, 0.16], y: [1, 1, 1] }, o: { x: [0.16, 0.16, 0.16], y: [0, 0, 0] }, t: 0, s: [15, 100, 100] },
                { i: { x: [0.2, 0.2, 0.2], y: [1, 1, 1] }, o: { x: [0.2, 0.2, 0.2], y: [0, 0, 0] }, t: 28, s: [102, 100, 100] },
                { t: 38, s: [100, 100, 100] }
              ]
            }
          },
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "rc",
                  d: 1,
                  s: { a: 0, k: [920, 160] },
                  p: { a: 0, k: [0, 0] },
                  r: { a: 0, k: 14 },
                  nm: "Plate_Rect"
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [0.03, 0.05, 0.09, 0.96] }, // Slate-950 #070b14
                  o: { a: 0, k: 100 },
                  r: 1,
                  nm: "Plate_Fill"
                },
                {
                  ty: "st",
                  c: { a: 0, k: [0.2, 0.25, 0.35, 0.8] },
                  o: { a: 0, k: 100 },
                  w: { a: 0, k: 1.5 },
                  nm: "Plate_Stroke"
                },
                {
                  ty: "tr",
                  p: { a: 0, k: [0, 0] },
                  a: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [100, 100] },
                  r: { a: 0, k: 0 },
                  o: { a: 0, k: 100 }
                }
              ]
            }
          ]
        },
        // 4. Jersey Badge Diamond / Emblem
        {
          ddd: 0,
          ind: 4,
          ty: 4,
          nm: "Jersey_Badge",
          sr: 1,
          ks: {
            o: { a: 0, k: 100 },
            r: {
              a: 1,
              k: [
                { i: { x: [0.2], y: [1] }, o: { x: [0.2], y: [0] }, t: 8, s: [-45] },
                { i: { x: [0.2], y: [1] }, o: { x: [0.2], y: [0] }, t: 32, s: [4] },
                { t: 45, s: [0] }
              ]
            },
            p: { a: 0, k: [110, 100, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: {
              a: 1,
              k: [
                { i: { x: [0.16, 0.16, 0.16], y: [1, 1, 1] }, o: { x: [0.16, 0.16, 0.16], y: [0, 0, 0] }, t: 5, s: [0, 0, 100] },
                { i: { x: [0.2, 0.2, 0.2], y: [1, 1, 1] }, o: { x: [0.2, 0.2, 0.2], y: [0, 0, 0] }, t: 30, s: [112, 112, 100] },
                { t: 42, s: [100, 100, 100] }
              ]
            }
          },
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "rc",
                  d: 1,
                  s: { a: 0, k: [110, 110] },
                  p: { a: 0, k: [0, 0] },
                  r: { a: 0, k: 18 },
                  nm: "Badge_Shape"
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [0.12, 0.16, 0.24, 1] },
                  o: { a: 0, k: 100 },
                  r: 1,
                  nm: "Badge_Fill"
                },
                {
                  ty: "st",
                  c: { a: 0, k: [0.88, 0.02, 0, 1] },
                  o: { a: 0, k: 100 },
                  w: { a: 0, k: 2.5 },
                  nm: "Badge_Stroke"
                },
                {
                  ty: "tr",
                  p: { a: 0, k: [0, 0] },
                  a: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [100, 100] },
                  r: { a: 0, k: 0 },
                  o: { a: 0, k: 100 }
                }
              ]
            }
          ]
        },
        // 5. Flashing Live Pulse Beacon Dot
        {
          ddd: 0,
          ind: 5,
          ty: 4,
          nm: "Live_Beacon",
          sr: 1,
          ks: {
            o: {
              a: 1,
              k: [
                { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [100] },
                { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 30, s: [20] },
                { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 60, s: [100] },
                { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 90, s: [20] },
                { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 120, s: [100] },
                { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 150, s: [20] },
                { t: 180, s: [100] }
              ]
            },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [200, 50, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: {
              a: 1,
              k: [
                { i: { x: [0.5, 0.5, 0.5], y: [1, 1, 1] }, o: { x: [0.5, 0.5, 0.5], y: [0, 0, 0] }, t: 0, s: [100, 100, 100] },
                { i: { x: [0.5, 0.5, 0.5], y: [1, 1, 1] }, o: { x: [0.5, 0.5, 0.5], y: [0, 0, 0] }, t: 30, s: [65, 65, 100] },
                { t: 60, s: [100, 100, 100] }
              ]
            }
          },
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "el",
                  d: 1,
                  p: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [12, 12] },
                  nm: "Beacon_Circle"
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [0.88, 0.02, 0, 1] },
                  o: { a: 0, k: 100 },
                  r: 1,
                  nm: "Beacon_Fill"
                },
                {
                  ty: "tr",
                  p: { a: 0, k: [0, 0] },
                  a: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [100, 100] },
                  r: { a: 0, k: 0 },
                  o: { a: 0, k: 100 }
                }
              ]
            }
          ]
        }
      ]
    }
  },

  cyber_neon: {
    id: 'cyber_neon',
    name: 'Cyber Neon (Esports HUD)',
    category: 'Lower Third',
    description: 'Futuristic sci-fi esports card with cyan/magenta pulse grid and glowing brackets',
    data: {
      v: "5.7.4",
      fr: 60,
      ip: 0,
      op: 180,
      w: 960,
      h: 210,
      nm: "Cyber_Neon_Esports",
      ddd: 0,
      assets: [],
      layers: [
        // 1. Neon Cyan Border Pulse
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: "Cyber_Border",
          sr: 1,
          ks: {
            o: {
              a: 1,
              k: [
                { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [90] },
                { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 45, s: [40] },
                { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 90, s: [100] },
                { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 135, s: [45] },
                { t: 180, s: [90] }
              ]
            },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [480, 105, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: {
              a: 1,
              k: [
                { i: { x: [0.15, 0.15, 0.15], y: [1, 1, 1] }, o: { x: [0.15, 0.15, 0.15], y: [0, 0, 0] }, t: 0, s: [0, 100, 100] },
                { t: 30, s: [100, 100, 100] }
              ]
            }
          },
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "rc",
                  d: 1,
                  s: { a: 0, k: [920, 170] },
                  p: { a: 0, k: [0, 0] },
                  r: { a: 0, k: 8 },
                  nm: "Border_Shape"
                },
                {
                  ty: "st",
                  c: { a: 0, k: [0, 0.94, 1, 1] }, // Cyan #00f0ff
                  o: { a: 0, k: 100 },
                  w: { a: 0, k: 2 },
                  nm: "Cyber_Stroke"
                },
                {
                  ty: "tr",
                  p: { a: 0, k: [0, 0] },
                  a: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [100, 100] },
                  r: { a: 0, k: 0 },
                  o: { a: 0, k: 100 }
                }
              ]
            }
          ]
        },
        // 2. Dark Carbon Plate
        {
          ddd: 0,
          ind: 2,
          ty: 4,
          nm: "Carbon_Plate",
          sr: 1,
          ks: {
            o: { a: 0, k: 95 },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [480, 105, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: { a: 0, k: [100, 100, 100] }
          },
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "rc",
                  d: 1,
                  s: { a: 0, k: [920, 170] },
                  p: { a: 0, k: [0, 0] },
                  r: { a: 0, k: 8 },
                  nm: "Carbon_Rect"
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [0.03, 0.04, 0.08, 1] },
                  o: { a: 0, k: 100 },
                  r: 1,
                  nm: "Carbon_Fill"
                },
                {
                  ty: "tr",
                  p: { a: 0, k: [0, 0] },
                  a: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [100, 100] },
                  r: { a: 0, k: 0 },
                  o: { a: 0, k: 100 }
                }
              ]
            }
          ]
        },
        // 3. Rotating Hex Badge Glow
        {
          ddd: 0,
          ind: 3,
          ty: 4,
          nm: "Hex_Badge",
          sr: 1,
          ks: {
            o: { a: 0, k: 100 },
            r: {
              a: 1,
              k: [
                { t: 0, s: [0] },
                { t: 180, s: [360] }
              ]
            },
            p: { a: 0, k: [110, 105, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: { a: 0, k: [100, 100, 100] }
          },
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "sr",
                  d: 1,
                  p: { a: 0, k: [0, 0] },
                  r: { a: 0, k: 0 },
                  pt: { a: 0, k: 6 },
                  or: { a: 0, k: 48 },
                  nm: "Hex_Star"
                },
                {
                  ty: "st",
                  c: { a: 0, k: [1, 0, 0.45, 0.9] }, // Magenta/Neon Pink
                  o: { a: 0, k: 100 },
                  w: { a: 0, k: 2 },
                  nm: "Hex_Stroke"
                },
                {
                  ty: "tr",
                  p: { a: 0, k: [0, 0] },
                  a: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [100, 100] },
                  r: { a: 0, k: 0 },
                  o: { a: 0, k: 100 }
                }
              ]
            }
          ]
        }
      ]
    }
  },

  champions_gold: {
    id: 'champions_gold',
    name: 'Champions Gold (Metallic Chevron)',
    category: 'Lower Third',
    description: 'Prestigious navy and gold broadcast ribbon with metallic expanding chevron',
    data: {
      v: "5.7.4",
      fr: 60,
      ip: 0,
      op: 180,
      w: 960,
      h: 200,
      nm: "Champions_Gold_Ribbon",
      ddd: 0,
      assets: [],
      layers: [
        // 1. 24K Gold Accent Sweep Bar
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: "Gold_Accent",
          sr: 1,
          ks: {
            o: { a: 0, k: 100 },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [480, 182, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: {
              a: 1,
              k: [
                { i: { x: [0.15, 0.15, 0.15], y: [1, 1, 1] }, o: { x: [0.15, 0.15, 0.15], y: [0, 0, 0] }, t: 0, s: [0, 100, 100] },
                { t: 25, s: [100, 100, 100] }
              ]
            }
          },
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "rc",
                  d: 1,
                  s: { a: 0, k: [920, 5] },
                  p: { a: 0, k: [0, 0] },
                  r: { a: 0, k: 2 },
                  nm: "Gold_Line"
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [0.83, 0.69, 0.22, 1] }, // Gold #d4af37
                  o: { a: 0, k: 100 },
                  r: 1,
                  nm: "Gold_Fill"
                },
                {
                  ty: "tr",
                  p: { a: 0, k: [0, 0] },
                  a: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [100, 100] },
                  r: { a: 0, k: 0 },
                  o: { a: 0, k: 100 }
                }
              ]
            }
          ]
        },
        // 2. Navy Studio Backplate
        {
          ddd: 0,
          ind: 2,
          ty: 4,
          nm: "Navy_Backplate",
          sr: 1,
          ks: {
            o: { a: 0, k: 98 },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [480, 100, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: {
              a: 1,
              k: [
                { i: { x: [0.16, 0.16, 0.16], y: [1, 1, 1] }, o: { x: [0.16, 0.16, 0.16], y: [0, 0, 0] }, t: 0, s: [10, 100, 100] },
                { t: 30, s: [100, 100, 100] }
              ]
            }
          },
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "rc",
                  d: 1,
                  s: { a: 0, k: [920, 160] },
                  p: { a: 0, k: [0, 0] },
                  r: { a: 0, k: 12 },
                  nm: "Navy_Rect"
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [0.02, 0.05, 0.12, 1] }, // Navy #060e1f
                  o: { a: 0, k: 100 },
                  r: 1,
                  nm: "Navy_Fill"
                },
                {
                  ty: "st",
                  c: { a: 0, k: [0.83, 0.69, 0.22, 0.5] },
                  o: { a: 0, k: 100 },
                  w: { a: 0, k: 1.5 },
                  nm: "Gold_Border"
                },
                {
                  ty: "tr",
                  p: { a: 0, k: [0, 0] },
                  a: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [100, 100] },
                  r: { a: 0, k: 0 },
                  o: { a: 0, k: 100 }
                }
              ]
            }
          ]
        }
      ]
    }
  }
};

if (typeof window !== 'undefined') {
  window.LOTTIE_PRESETS = LOTTIE_PRESETS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LOTTIE_PRESETS;
}
