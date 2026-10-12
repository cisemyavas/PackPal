import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserProfile } from "../services/firestoreService";
import { getColors } from "../constants/colors";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [mode, setMode] = useState("light");
  const [palette, setPalette] = useState("forest");
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    let active = true;

    if (!user?.uid) {
      setMode("light");
      setPalette("forest");
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    getUserProfile(user.uid)
      .then((profile) => {
        if (!active) return;
        setMode(profile?.theme === "dark" ? "dark" : "light");
        setPalette(["forest", "coral", "ocean", "lime"].includes(profile?.colorTheme) ? profile.colorTheme : "forest");
      })
      .catch((error) => console.warn("Theme preferences could not be loaded:", error))
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [user?.uid]);

  const applyPreferences = useCallback(({ theme: nextMode, colorTheme: nextPalette }) => {
    if (nextMode === "light" || nextMode === "dark") setMode(nextMode);
    if (["forest", "coral", "ocean", "lime"].includes(nextPalette)) setPalette(nextPalette);
  }, []);

  const colors = useMemo(() => getColors(mode, palette), [mode, palette]);
  const value = useMemo(() => ({ mode, palette, colors, loading, applyPreferences }), [mode, palette, colors, loading, applyPreferences]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
