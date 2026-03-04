const fs = require('fs');

const path = 'd:/agpaii-meneh/web.agpaiidigital.org/src/components/nav/desktop_sidebar.tsx';
let code = fs.readFileSync(path, 'utf8');

// replace NavList with NavGroups in declaration
code = code.replace('let navList: any[] = [];', 'let navGroups: {group: string | null; items: any[]}[] = [];');

// 1. isSocialMedia block
const smReplacement = `    navGroups = [
      {
        group: "Sosial Media",
        items: [
          {
            id: "beranda",
            label: "Beranda",
            icon: <HomeIcon className="size-6" />,
            active: pathname === "/social-media",
            link: "/social-media",
          },
          {
            id: "disukai",
            label: "Disukai",
            icon: <HeartIcon className="size-6" />,
            active: pathname === "/social-media/liked",
            link: "/social-media/liked",
          },
          {
            id: "posting",
            label: "Posting Baru",
            icon: <PlusIcon className="size-6" />,
            link: "/social-media/post/new",
            active: false,
          },
          {
            id: "pesan",
            label: "Pesan",
            icon: <ChatBubbleLeftIcon className="size-6" />,
            link: "/social-media/chat",
            active: pathname === "/social-media/chat",
          },
          {
            id: "profil",
            label: "Profil",
            icon: <UserIcon className="size-6" />,
            link: \`/profile/\${auth.id}\`,
            active: pathname.startsWith(\`/profile/\${auth.id}\`),
          }
        ]
      }
    ];`;
// Find and replace the block for isSocialMedia
// Search for `    navList = [` ... `    ];` but only the first one
code = code.replace(/    navList = \[\s*\{\s*id: "beranda"[\s\S]*?\];\s*\} else if \(isStudent\)/, smReplacement + ' } else if (isStudent)');


// 2. isStudent block
const studentReplacement = `    navGroups = [
      {
        group: "Menu Siswa",
        items: [
          {
            label: "Beranda",
            icon: <HomeIcon className="size-6" />,
            active: pathname === "/" || pathname.startsWith("/beranda"),
            link: "/beranda",
          },
          {
            label: "Kelas",
            icon: <BookOpenIcon className="size-6" />,
            active: pathname.startsWith("/kelas") && !pathname.startsWith("/kelas-guru"),
            link: "/kelas",
          },
          {
            label: "Forum",
            icon: <ChatBubbleLeftRightIcon className="size-6" />,
            active: pathname.startsWith("/forum"),
            link: "/forum",
          },
          {
            label: "Profil",
            icon: <UserIcon className="size-6" />,
            link: \`/profile-siswa\`,
            active: pathname.startsWith(\`/profile-siswa\`),
          }
        ]
      }
    ];`;
code = code.replace(/    navList = \[\s*\{\s*label: "Beranda",\s*icon: <HomeIcon[\s\S]*?\];\s*\} else if \(isMitra\)/, studentReplacement + ' } else if (isMitra)');


// 3. isMitra block
const mitraReplacement = `    navGroups = [
      {
        group: "Mitra",
        items: [
          {
            label: "Mitra Dashboard",
            icon: <HomeIcon className="size-6" />,
            active: pathname.startsWith("/mitra"),
            link: "/mitra",
          },
          {
            label: "Profil",
            icon: <UserIcon className="size-6" />,
            active: pathname === "/profile-mitra",
            link: "/profile-mitra",
          }
        ]
      }
    ];`;
code = code.replace(/    navList = \[\s*\{\s*label: "Mitra Dashboard"[\s\S]*?\];\s*\} else \{/, mitraReplacement + ' } else {');


// 4. default Guru block
const guruReplacement = `    // Default Guru 
    navGroups = [
      {
        group: "Menu Utama",
        items: [
          {
            label: "Dashboard",
            icon: <HomeIcon className="size-6" />,
            active: pathname.startsWith("/dashboard") || pathname === "/beranda" || pathname === "/",
            link: "/",
          },
          {
            label: "KTA Digital",
            icon: <img src="/svg/ikon-kta.svg" className="size-6 object-contain" alt="" />,
            active: pathname.startsWith("/kta"),
            link: "/kta",
          },
          {
            label: "Profil",
            icon: <UserIcon className="size-6" />,
            active: pathname.startsWith(\`/profile/\${auth.id}\`) || pathname === "/profile/edit",
            link: \`/profile/edit\`,
          }
        ]
      },
      {
        group: "Interaksi & Komunikasi",
        items: [
          {
            label: "Social Media",
            icon: <img src="/svg/ikon-sosmed.svg" className="size-6 object-contain grayscale-[50%]" alt="" />,
            active: pathname.startsWith("/social-media"),
            link: "/social-media",
          },
          {
            label: "Pesan",
            icon: <ChatBubbleLeftIcon className="size-6" />,
            link: "/social-media/chat",
            active: pathname.startsWith("/social-media/chat"),
          },
          {
            label: "Live",
            icon: <img src="/svg/ikon-live.svg" className="size-6 object-contain grayscale-[50%]" alt="" />,
            link: "/live",
            active: pathname.startsWith("/live"),
          },
          {
            label: "Acara",
            icon: <img src="/svg/ikon event.svg" className="size-6 object-contain grayscale-[50%]" alt="" />,
            link: "/event",
            active: pathname.startsWith("/event"),
          },
        ]
      },
      {
        group: "Pendidikan & Islami",
        items: [
          {
            label: "Modul Digital",
            icon: <img src="/svg/modul_digital.svg" className="size-6 object-contain grayscale-[50%]" alt="" />,
            link: "/modul-ajar",
            active: pathname.startsWith("/modul"),
          },
          {
            label: "Al-Qur'an",
            icon: <img src="/svg/ikon alquran.svg" className="size-6 object-contain grayscale-[50%]" alt="" />,
            link: "/murrotal/surat",
            active: pathname.startsWith("/murrotal"),
          },
          {
            label: "Ramadhan",
            icon: <img src="/svg/ikon ramadhan.svg" className="size-6 object-contain grayscale-[50%]" alt="" />,
            link: "/ramadhan",
            active: pathname.startsWith("/ramadhan"),
          }
        ]
      },
      {
        group: "Layanan Lainnya",
        items: [
          {
            label: "Marketplace",
            icon: <img src="/svg/ikon-marketplace.svg" className="size-6 object-contain grayscale-[50%]" alt="" />,
            link: "/marketplace",
            active: pathname.startsWith("/marketplace"),
          },
          {
            label: "Lainnya",
            icon: <img src="/svg/lainnya.svg" className="size-6 object-contain grayscale-[50%]" alt="" />,
            link: "/other",
            active: pathname.startsWith("/other"),
          }
        ]
      }
    ];
  }`;
code = code.replace(/\/\/ Default Guru\s*navList = \[\s*\{\s*label: "Dashboard"[\s\S]*?\];\s*\}/, guruReplacement);


// 5. Replace render logic to loop navGroups
const renderReplacement = `      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-hide">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1.5">
            {group.group && (
              <h3 className="hidden lg:block px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {group.group}
              </h3>
            )}
            {group.items.map((item, i) => (
              <Link
                key={i}
                href={item.link}
                className={clsx(
                  "flex items-center gap-3 lg:gap-4 px-3 py-3 lg:px-4 rounded-xl transition-all duration-200 group relative",
                  item.active
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-teal-600 font-medium"
                )}
                title={item.label}
              >
                <div className={clsx(item.active ? "text-teal-600" : "text-slate-400 group-hover:text-teal-500 transition-colors")}>
                  {item.icon}
                </div>
                <span className="hidden lg:block text-sm">
                  {item.label}
                </span>
                
                {/* Tooltip untuk layout md di mana label disembunyikan */}
                <div className="absolute left-16 z-50 p-2 text-xs text-white bg-slate-800 rounded shadow-lg opacity-0 invisible group-hover:visible lg:hidden group-hover:opacity-100 transition-all pointer-events-none">
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>`;

code = code.replace(/<div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-hide">[\s\S]*?<\/div>\s*<div className="p-4 border-t border-slate-100">/, renderReplacement + '\n      <div className="p-4 border-t border-slate-100">');

fs.writeFileSync(path, code);
