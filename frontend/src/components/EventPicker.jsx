import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/lib/appState";
import { useLang } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  useEffect(() => { axios.get(`${API}/events`).then((r) => setEvents(r.data)); }, []);
  return [events, setEvents];
};

export const EventPicker = ({ value, onChange }) => {
  const { t } = useLang();
  const [events] = useEvents();
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">{t("event")}</p>
      <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? null : v)}>
        <SelectTrigger className="bg-stone-900" data-testid="event-picker"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">{t("ev_none")}</SelectItem>
          {events.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
};
