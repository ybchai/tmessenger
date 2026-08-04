import { useAuthStore } from "../../store/useAuthStore";
import { languages } from "../../data/languages";

export default function LanguageSelector() {
  const { authUser, updatePreferredLanguage } = useAuthStore();

  async function handleChange(e) {
    await updatePreferredLanguage(e.target.value);
  }

  return (
    <select
      value={authUser?.preferred_language || "en"}
      onChange={handleChange}
      className="
              border
              rounded
              px-2
              py-1
            "
    >
      {languages.map((language) => (
        <option key={language.code} value={language.code}>
          {language.name}
        </option>
      ))}
    </select>
  );
}
