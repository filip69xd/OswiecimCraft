import { Crown, Shield, Hammer, Users } from "lucide-react";
import { TEAM } from "../data";
import SectionHeader from "./SectionHeader";
import { useReveal } from "../hooks/useReveal";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  Owner: <Crown className="w-5 h-5" />,
  Admin: <Shield className="w-5 h-5" />,
  Moderator: <Users className="w-5 h-5" />,
  Builder: <Hammer className="w-5 h-5" />,
};

export default function Team() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="team" className="relative py-24 md:py-32 px-5 md:px-8 bg-mc-panel/30 border-y border-mc-border">
      <div
        ref={ref}
        className={`max-w-5xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <SectionHeader
          tag="Zespół"
          title="Ludzie za serwerem"
          subtitle="Zespół, który dba o porządek, rozwój i dobrą atmosferę na OświęcimCraft."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
          {TEAM.map((member, i) => (
            <div
              key={member.role}
              className="bg-mc-panel border border-mc-border rounded-sm p-6 text-center card-hover"
              style={{ animation: visible ? `slideUp 0.6s ease-out ${i * 0.1}s both` : undefined }}
            >
              <div
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-sm"
                style={{ backgroundColor: `${member.color}20`, color: member.color }}
              >
                {ROLE_ICONS[member.role] ?? <Users className="w-5 h-5" />}
              </div>
              <h3 className="font-bold text-mc-text text-sm mb-1">{member.name}</h3>
              <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: member.color }}>
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
