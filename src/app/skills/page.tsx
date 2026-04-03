import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { skillSections, technicalSkills, linkedinSkills } from '@/data/skills';

export default function SkillsPage() {
  return (
    <>
      <Header />
      <main className="pt-14">
        <section className="grid-bg py-20">
          <div className="max-w-5xl mx-auto px-6">
            <p className="section-label mb-3">~/skills</p>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold mb-4">
              Skills & Learning
            </h1>
            <p className="text-text-secondary max-w-xl">
              Courses completed. Credentials earned. Things I&apos;m actively building knowledge in.
            </p>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-12">
            {/* Certified Skills */}
            {skillSections.map((section) => (
              <div key={section.label} className="mb-12">
                <p className="section-label mb-6 pb-3 border-b border-border">
                  {section.label}
                </p>
                <div className="space-y-0">
                  {section.skills.map((skill, i) => (
                    <div
                      key={skill.title}
                      className={`flex items-start justify-between py-4 ${
                        i < section.skills.length - 1 ? 'border-b border-border/50' : ''
                      }`}
                    >
                      <div>
                        <p className="text-text-primary text-sm font-medium">
                          {skill.title}
                        </p>
                        <p className="text-text-muted text-xs mt-0.5">
                          {skill.issuer}
                          {skill.year && <> &middot; {skill.year}</>}
                        </p>
                      </div>
                      {skill.credential && (
                        <span className="text-accent text-xs font-mono flex-shrink-0">
                          {skill.credential}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Technical Skills */}
            <div className="mb-12">
              <p className="section-label mb-6 pb-3 border-b border-border">
                TECHNICAL SKILLS (NOT CERTIFIED BUT REAL)
              </p>
              <div className="flex flex-wrap gap-2">
                {technicalSkills.map((skill) => (
                  <span
                    key={skill}
                    className="tag"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* LinkedIn Verified */}
            <div className="mb-12">
              <p className="section-label mb-6 pb-3 border-b border-border">
                LINKEDIN VERIFIED SKILLS
              </p>
              <div className="flex flex-wrap gap-2">
                {linkedinSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-md border border-border text-text-secondary text-xs hover:border-accent/40 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
