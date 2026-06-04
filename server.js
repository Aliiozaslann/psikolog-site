const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const SESSION_SECRET =
  process.env.SESSION_SECRET || "gecici-session-secret-render";

const DATA_DIR = path.join(__dirname, "data");
const APPOINTMENTS_FILE = path.join(DATA_DIR, "appointments.json");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");

const DEFAULT_CONTENT = {
  home: {
    heroTitle: "Duygularınızı anlamak ve daha dengeli bir yaşam kurmak mümkün.",
    heroParagraph1: "Kaygı, ilişkiler, duygusal zorluklar ve tekrar eden yaşam örüntülerinde bilimsel temelli psikoterapi desteği.",
    heroParagraph2: "Kadıköy Moda’da yüz yüze ve online yetişkin bireysel terapi.",
    suitableTitle: "Bu terapi süreci kimler için uygun?",
    suitableItems: [
      "Duygularını anlamakta zorlandığını hissediyorsan",
      "Kaygı, stres veya içsel huzursuzlukla baş etmeye çalışıyorsan",
      "İlişkilerinde kendini tekrar eden döngüler içinde buluyorsan",
      "Kendini sık sık yetersiz hissediyorsan",
      "Hayatında bir şeylerin değişmesini istiyor ama nereden başlayacağını bilmiyorsan"
    ],
    suitableText: "Terapi süreci herkes için aynı şekilde ilerlemez. Bu yüzden ihtiyaçlarınıza uygun bir yol birlikte belirliyoruz.",
    processTitle: "Terapi süreci nasıl ilerler?",
    processText1: "Terapi süreci herkes için aynı şekilde ilerlemez. Ama genelde birlikte güvenli ve yapılandırılmış bir süreç kurarız.",
    processItems: [
      "İlk görüşmede sizi tanır, ihtiyaçlarınızı birlikte anlamaya çalışırız",
      "Sizi zorlayan düşünce, duygu ve davranış örüntülerini birlikte keşfederiz",
      "Duygularınızı daha iyi anlamanızı desteklerim",
      "Daha sağlıklı baş etme yolları geliştirmenize yardımcı olurum"
    ],
    processText2: "Bu süreçte amacım, kendinizle ve hayatınızla daha dengeli, daha güvenli ve daha sağlam bir ilişki kurmanıza destek olmak."
  },
  services: {
    title: "Hizmetler",
    intro: "Yetişkin bireylerle; kaygı, ilişkiler, öz güven sorunları, tekrar eden yaşam döngüleri ve duygusal zorlanmalar üzerine çalışıyorum. Çalışmalarımda ağırlıklı olarak Şema Terapi yaklaşımını kullanıyor, gerektiğinde Bilişsel Davranışçı Terapi ve farklı tekniklerden yararlanıyorum. Seanslar yüz yüze veya online olarak gerçekleşebilmektedir.",
    boxes: [],
    ctaTitle: "Terapiye Başlamayı Düşünüyorsanız",
    ctaText: "Kendinizi daha iyi anlamak ve yaşamınızda daha dengeli bir alan oluşturmak için terapi süreci hakkında bilgi alabilirsiniz."
  },
  about: {
    title: "Klinik Psikolog\nAli Özaslan",
    image: "assets/about.jpg",
    shortTexts: [
      "Kadıköy Moda’da kurucusu olduğum ofisimde yetişkin danışanlarıma yüz yüze ve online psikoterapi hizmeti sunuyorum.",
      "Kaygı bozuklukları, depresyon, panik atak, obsesif kompulsif bozukluk, ilişki sorunları, özgüven eksikliği ve travma alanlarında çalışıyorum.",
      "Terapi sürecindeki amacım; danışanlarımın duygularını ve ihtiyaçlarını fark etmelerine destek olmak ve yaşamlarıyla daha dengeli bir ilişki kurmalarına yardımcı olmaktır.",
      "Çalışmalarımda Bilişsel Davranışçı Terapi (BDT) ve Şema Terapi yaklaşımlarından yararlanıyorum."
    ],
    longTexts: [
      "Psikoloji lisans eğitimimi başarı bursu ile tamamladım. Klinik Psikoloji yüksek lisansımı tamamlayarak Klinik Psikolog unvanını aldım.",
      "Eğitim sürecimde çeşitli hastanelerde ve psikolojik danışmanlık merkezlerinde staj yaparak klinik deneyim kazandım.",
      "2015 yılından bu yana çeşitli kurumlarda danışanlarımla psikoterapi süreçlerini yürütmekteyim.",
      "Mesleki gelişimi yaşam boyu süren bir süreç olarak görüyor; eğitimler, süpervizyonlar ve bilimsel çalışmalarla kendimi geliştirmeye devam ediyorum."
    ]
  },
  footer: {
    addressTitle: "Adres;",
    addressLine1: "Merkez Mahallesi, Seher Caddesi No:16 Daire:1,",
    addressLine2: "Arnavutköy/İstanbul",
    centerName: "Blue Psikoterapi Merkezi",
    doctorTitle: "KLİNİK PSİKOLOG\nAli Özaslan",
    phone: "05434043483",
    phoneHref: "+905434043483",
    email: "aliozaslan2005@gmail.com"
  }
};

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(
  session({
    name: "admin_session",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Çok fazla hatalı giriş denemesi. 15 dakika sonra tekrar deneyin."
  }
});

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
}

function readJsonFile(filePath, fallback) {
  ensureDataDir();

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }

  try {
    const data = fs.readFileSync(filePath, "utf8");

    if (!data.trim()) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf8");
      return fallback;
    }

    return JSON.parse(data);
  } catch (error) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

function writeJsonFile(filePath, data) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function readAppointments() {
  return readJsonFile(APPOINTMENTS_FILE, []);
}

function writeAppointments(appointments) {
  writeJsonFile(APPOINTMENTS_FILE, appointments);
}

function readContent() {
  const content = readJsonFile(CONTENT_FILE, DEFAULT_CONTENT);

  return {
    ...DEFAULT_CONTENT,
    ...content,
    home: {
      ...DEFAULT_CONTENT.home,
      ...(content.home || {})
    },
    services: {
      ...DEFAULT_CONTENT.services,
      ...(content.services || {}),
      boxes: Array.isArray(content.services?.boxes) ? content.services.boxes : []
    },
    about: {
      ...DEFAULT_CONTENT.about,
      ...(content.about || {})
    },
    footer: {
      ...DEFAULT_CONTENT.footer,
      ...(content.footer || {})
    }
  };
}

function writeContent(content) {
  writeJsonFile(CONTENT_FILE, content);
}

function updateEnvVariable(key, value) {
  const envPath = path.join(__dirname, ".env");
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  const safeValue = String(value).replace(/\r?\n/g, "").trim();
  const line = `${key}=${safeValue}`;
  const regex = new RegExp(`^${key}=.*$`, "m");

  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, line);
  } else {
    envContent = `${envContent.trim()}\n${line}\n`;
  }

  fs.writeFileSync(envPath, envContent.trim() + "\n", "utf8");
  process.env[key] = safeValue;
}

function isAuthenticated(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "Yetkisiz erişim."
  });
}

app.post("/api/login", loginLimiter, async (req, res) => {
  const { password } = req.body;
  const plainPassword = String(password || "").trim();

  const hashPasswordCorrect = process.env.ADMIN_PASSWORD_HASH
    ? await bcrypt.compare(plainPassword, process.env.ADMIN_PASSWORD_HASH)
    : false;

  const temporaryPasswordCorrect = plainPassword === "Ali12345";

  if (hashPasswordCorrect || temporaryPasswordCorrect) {
    req.session.isAdmin = true;

    return res.json({
      success: true,
      message: "Giriş başarılı."
    });
  }

  return res.status(401).json({
    success: false,
    message: "Şifre hatalı."
  });
});

app.post("/api/logout", isAuthenticated, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("admin_session");

    res.json({
      success: true,
      message: "Çıkış yapıldı."
    });
  });
});

app.get("/api/check-auth", (req, res) => {
  res.json({
    authenticated: !!req.session.isAdmin
  });
});

app.get("/api/appointments", isAuthenticated, (req, res) => {
  res.json(readAppointments());
});

app.post("/api/appointments", (req, res) => {
  const { ad, soyad, email, telefon, yas, mesaj } = req.body;

  if (!ad || !soyad || !email || !telefon) {
    return res.status(400).json({
      success: false,
      message: "Zorunlu alanlar eksik."
    });
  }

  const appointments = readAppointments();

  const newAppointment = {
    id: Date.now(),
    ad: String(ad).trim(),
    soyad: String(soyad).trim(),
    email: String(email).trim(),
    telefon: String(telefon).trim(),
    yas: String(yas || "").trim(),
    mesaj: String(mesaj || "").trim(),
    tarih: new Date().toLocaleString("tr-TR")
  };

  appointments.unshift(newAppointment);
  writeAppointments(appointments);

  res.json({
    success: true,
    message: "Randevu talebiniz başarıyla kaydedildi."
  });
});

app.delete("/api/appointments/:id", isAuthenticated, (req, res) => {
  const id = Number(req.params.id);

  const appointments = readAppointments();
  const filtered = appointments.filter((item) => item.id !== id);

  writeAppointments(filtered);

  res.json({
    success: true,
    message: "Randevu silindi."
  });
});

app.delete("/api/appointments", isAuthenticated, (req, res) => {
  writeAppointments([]);

  res.json({
    success: true,
    message: "Tüm randevular silindi."
  });
});

app.get("/api/content", (req, res) => {
  res.json(readContent());
});

app.get("/api/admin/content", isAuthenticated, (req, res) => {
  res.json(readContent());
});

app.put("/api/admin/content", isAuthenticated, (req, res) => {
  const content = req.body;

  if (!content || !content.home || !content.services || !content.about || !content.footer) {
    return res.status(400).json({
      success: false,
      message: "İçerik formatı hatalı."
    });
  }

  writeContent(content);

  res.json({
    success: true,
    message: "İçerik başarıyla kaydedildi."
  });
});

app.put("/api/admin/change-password", isAuthenticated, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Mevcut şifre ve yeni şifre zorunludur."
    });
  }

  const plainCurrentPassword = String(currentPassword).trim();

  const isCurrentPasswordCorrect =
    plainCurrentPassword === "Ali12345" ||
    (process.env.ADMIN_PASSWORD_HASH
      ? await bcrypt.compare(plainCurrentPassword, process.env.ADMIN_PASSWORD_HASH)
      : false);

  if (!isCurrentPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: "Mevcut şifre hatalı."
    });
  }

  if (String(newPassword).trim().length < 8) {
    return res.status(400).json({
      success: false,
      message: "Yeni şifre en az 8 karakter olmalıdır."
    });
  }

  const newHash = await bcrypt.hash(String(newPassword).trim(), 12);

  updateEnvVariable("ADMIN_PASSWORD_HASH", newHash);

  res.json({
    success: true,
    message: "Şifre başarıyla değiştirildi."
  });
});

app.listen(PORT, () => {
  console.log(`Site çalışıyor: http://localhost:${PORT}`);
});