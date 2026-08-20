const navigation = [
  { href: "#mission", label: "Our mission" }, { href: "#events", label: "Our events" },
  { href: "#method", label: "Our method" }, { href: "#contact", label: "Let’s chat" },
];

export function SiteHeader() {
  return <header className="site-header"><a className="wordmark" href="#mission" aria-label="Lai home">lai</a><nav aria-label="Primary navigation"><ul>{navigation.map((item) => <li key={item.href}><a href={item.href}><span aria-hidden="true" />{item.label}</a></li>)}</ul></nav></header>;
}
