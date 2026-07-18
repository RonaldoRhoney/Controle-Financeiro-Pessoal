import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STORAGE_KEY = "finwise-ai-consent-v1";

export function hasAiConsent() {
  return typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "granted";
}

/**
 * Gate for any feature that sends user data to the third-party AI provider
 * (Lovable AI Gateway / Google Gemini). Required by Google Play policy: prominent
 * disclosure + opt-in before the first use of an embedded AI feature.
 */
export function useAiConsent() {
  const { t } = useTranslation();
  const [granted, setGranted] = useState(hasAiConsent);
  const [pending, setPending] = useState<null | (() => void)>(null);

  const withConsent = useCallback((action: () => void) => {
    if (hasAiConsent()) {
      action();
      return;
    }
    setPending(() => action);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "granted");
    setGranted(true);
    const action = pending;
    setPending(null);
    action?.();
  };

  const decline = () => setPending(null);

  const ConsentDialog = () => (
    <AlertDialog open={pending !== null} onOpenChange={(open) => !open && decline()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("aiConsent.title")}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{t("aiConsent.body")}</p>
            <p>
              <Link to="/privacidade" className="text-primary hover:underline">
                {t("aiConsent.link")}
              </Link>
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={decline}>{t("aiConsent.decline")}</AlertDialogCancel>
          <AlertDialogAction onClick={accept}>{t("aiConsent.accept")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { granted, withConsent, ConsentDialog };
}
