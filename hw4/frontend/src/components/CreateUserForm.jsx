import { useState } from "react";
import "./create-user-form.css";

const initialState = {
  beans: "",
  method: "",
  rating: "",
  notes: "",
  brewedAt: "",
};

export function CreateUserForm({ onSubmit }) {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ───────── helpers ───────── */
  const validate = ({ beans, method, rating, notes, brewedAt }) => {
    const errs = {};

    if (!beans.trim() || beans.length < 3 || beans.length > 40)
      errs.beans = "Beans must be between 3 and 40 characters";
    if (!["v60", "aeropress", "chemex", "espresso"].includes(method))
      errs.method = "Invalid brewing method";
    if (rating && (rating < 1 || rating > 5))
      errs.rating = "Rating must be between 1 and 5";
    if (notes && notes.length > 200)
      errs.notes = "Notes must be less than 200 characters";
    if (
      brewedAt &&
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(brewedAt)
    )
      errs.brewedAt = "Invalid date format";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({
      ...v,
      [name]: name === "rating" ? Number(value) || "" : value, // Convert rating to a number
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setLoading(true);
      console.log("vales", values);
      await onSubmit(values); // await add(user) із useUsers()
      setValues(initialState); // clear form
    } finally {
      setLoading(false);
    }
  };

  /* ───────── render ───────── */
  return (
    <form className="cuf-card" onSubmit={handleSubmit}>
      <label className="cuf-field">
        <span className="cuf-label">Beans</span>
        <input
          className="cuf-input"
          type="text"
          name="beans"
          value={values.beans}
          onChange={handleChange}
          placeholder="Ethiopian Yirgacheffe"
          disabled={loading}
        />
        {errors.beans && <span className="cuf-error">{errors.beans}</span>}
      </label>

      <label className="cuf-field">
        <span className="cuf-label">Method</span>
        <select
          className="cuf-input"
          name="method"
          value={values.method}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="">Select method</option>
          <option value="v60">V60</option>
          <option value="aeropress">Aeropress</option>
          <option value="chemex">Chemex</option>
          <option value="espresso">Espresso</option>
        </select>
        {errors.method && <span className="cuf-error">{errors.method}</span>}
      </label>

      <label className="cuf-field">
        <span className="cuf-label">Rating</span>
        <input
          className="cuf-input"
          type="number"
          name="rating"
          value={values.rating}
          onChange={handleChange}
          placeholder="1-5"
          disabled={loading}
        />
        {errors.rating && <span className="cuf-error">{errors.rating}</span>}
      </label>

      <label className="cuf-field">
        <span className="cuf-label">Notes</span>
        <textarea
          className="cuf-input"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          placeholder="Tasting notes..."
          disabled={loading}
        />
        {errors.notes && <span className="cuf-error">{errors.notes}</span>}
      </label>

      <label className="cuf-field">
        <span className="cuf-label">Brewed At</span>
        <input
          className="cuf-input"
          type="text"
          name="brewedAt"
          value={values.brewedAt || null}
          onChange={handleChange}
          placeholder="YYYY-MM-DDTHH:mm:ss.sssZ"
          disabled={loading}
        />
        {errors.brewedAt && (
          <span className="cuf-error">{errors.brewedAt}</span>
        )}
      </label>

      <button className="cuf-btn" type="submit" disabled={loading}>
        {loading ? "Saving…" : "Create user"}
      </button>
    </form>
  );
}
