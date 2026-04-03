interface StatusPillProps {
  status: string;
}

export default function StatusPill({ status }: StatusPillProps) {
  const normalized = status.toLowerCase().replace(/\s/g, '');
  return (
    <span className={`pill pill-${normalized}`}>
      {status}
    </span>
  );
}
