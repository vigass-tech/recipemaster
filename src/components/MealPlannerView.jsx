import React, { useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

export default function MealPlannerView({
  mealPlan,
  setMealPlan,
  recipes,
  onSelectRecipe,
  showToast
}) {
  const [activeSlotModal, setActiveSlotModal] = useState(null); // { day, meal }
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [groceryChecks, setGroceryChecks] = useState({});

  const assignRecipeToSlot = (day, meal, recipe) => {
    setMealPlan((prev) => ({
      ...prev,
      [`${day}-${meal}`]: recipe
    }));
    setActiveSlotModal(null);
    showToast(`Added ${recipe.title} to ${day} ${meal}`, 'success');
  };

  const removeRecipeFromSlot = (day, meal) => {
    setMealPlan((prev) => {
      const updated = { ...prev };
      delete updated[`${day}-${meal}`];
      return updated;
    });
  };

  // Compile weekly grocery shopping list
  const getAggregatedGroceries = () => {
    const list = [];
    Object.values(mealPlan).forEach((rec) => {
      if (rec && rec.ingredients) {
        rec.ingredients.forEach((ing) => {
          list.push({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            recipeTitle: rec.title
          });
        });
      }
    });
    return list;
  };

  const groceries = getAggregatedGroceries();

  const copyGroceries = () => {
    const text = groceries
      .map((g) => `• ${g.amount ? g.amount + ' ' : ''}${g.unit ? g.unit + ' ' : ''}${g.name} (for ${g.recipeTitle})`)
      .join('\n');
    navigator.clipboard.writeText(`Weekly Grocery Shopping List:\n\n${text}`);
    showToast('Weekly grocery list copied to clipboard!', 'success');
  };

  return (
    <div style={{ marginTop: '24px' }}>
      {/* Header and Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '2rem' }}>Weekly Meal Planner</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Schedule your breakfasts, lunches, and dinners, and generate an automatic shopping list.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className={`btn ${showShoppingList ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowShoppingList(!showShoppingList)}
          >
            🛒 {showShoppingList ? 'Hide Shopping List' : `View Grocery List (${groceries.length} items)`}
          </button>
        </div>
      </div>

      {/* Shopping List Drawer / View */}
      {showShoppingList && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.4rem' }}>🛒 Auto-Generated Weekly Grocery List</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline btn-sm" onClick={copyGroceries}>
                📋 Copy All Items
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowShoppingList(false)}>
                ✕ Close
              </button>
            </div>
          </div>

          {groceries.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              Your meal plan is currently empty! Add recipes below to populate your grocery list.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {groceries.map((item, idx) => {
                const isChecked = !!groceryChecks[idx];
                return (
                  <div
                    key={idx}
                    className={`ingredient-item ${isChecked ? 'checked' : ''}`}
                    onClick={() => setGroceryChecks((p) => ({ ...p, [idx]: !p[idx] }))}
                  >
                    <div className="checkbox-custom">{isChecked && '✓'}</div>
                    <div style={{ flex: 1 }}>
                      <strong>{item.amount} {item.unit}</strong> {item.name}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        from {item.recipeTitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 7-Day Planner Grid */}
      <div className="planner-grid">
        {DAYS.map((day) => {
          // Calculate daily calories
          let dayCalories = 0;
          MEALS.forEach((meal) => {
            const r = mealPlan[`${day}-${meal}`];
            if (r && r.calories) dayCalories += r.calories;
          });

          return (
            <div key={day} className="planner-day-card">
              <div className="day-header">
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>{day}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Est. {dayCalories} kcal total
                  </span>
                </div>
              </div>

              {MEALS.map((meal) => {
                const recipe = mealPlan[`${day}-${meal}`];

                return (
                  <div key={meal} className="meal-slot">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)', fontWeight: 600 }}>
                        {meal}
                      </span>

                      {recipe && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 6px', fontSize: '0.75rem', color: '#ef4444' }}
                          onClick={() => removeRecipeFromSlot(day, meal)}
                          title="Remove recipe"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {recipe ? (
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        onClick={() => onSelectRecipe(recipe)}
                      >
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {recipe.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            ⏱️ {recipe.cookTime || 20}m • 🔥 {recipe.calories || 400} kcal
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', border: '1px dashed var(--border-subtle)', justifyContent: 'center' }}
                        onClick={() => setActiveSlotModal({ day, meal })}
                      >
                        + Add {meal}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Recipe Picker Modal for Meal Slot */}
      {activeSlotModal && (
        <div className="modal-overlay" onClick={() => setActiveSlotModal(null)}>
          <div
            className="modal-container"
            style={{ maxWidth: '640px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>
                Select Recipe for {activeSlotModal.day} {activeSlotModal.meal}
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setActiveSlotModal(null)}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
              {recipes.map((r) => (
                <div
                  key={r._id || r.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}
                  onClick={() => assignRecipeToSlot(activeSlotModal.day, activeSlotModal.meal, r)}
                >
                  <img
                    src={r.image}
                    alt={r.title}
                    style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{r.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {r.category} • {r.cuisine} • ⏱️ {(r.prepTime || 0) + (r.cookTime || 0)}m
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm">Select</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
