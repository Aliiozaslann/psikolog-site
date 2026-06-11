const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
}

/* ---------- HELPERS ---------- */

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value || "";
  }
}

function renderList(id, items) {
  const element = document.getElementById(id);

  if (!element) return;

  element.innerHTML = "";

  if (!Array.isArray(items)) return;

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  });
}

function renderParagraphs(id, items) {
  const element = document.getElementById(id);

  if (!element) return;

  element.innerHTML = "";

  if (!Array.isArray(items)) return;

  items.forEach((item) => {
    const p = document.createElement("p");
    p.textContent = item;
    element.appendChild(p);
  });
}

/* ---------- PUBLIC CONTENT RENDER ---------- */

async function loadPublicContent() {
  const hasHomeContent = document.getElementById("home-hero-title");
  const hasServicesContent = document.getElementById("services-title");
  const hasAboutContent = document.getElementById("about-title");
  const hasFooterContent = document.getElementById("footer-address-title");
  const hasTherapyMethodsContent = document.getElementById("therapy-methods-main-title");

  if (!hasHomeContent && !hasServicesContent && !hasAboutContent && !hasFooterContent && !hasTherapyMethodsContent) return;

  try {
    const response = await fetch("/api/content");
    const content = await response.json();

    if (hasHomeContent && content.home) {
      setText("home-hero-title", content.home.heroTitle);
      setText("home-hero-p1", content.home.heroParagraph1);
      setText("home-hero-p2", content.home.heroParagraph2);

      setText("home-suitable-title", content.home.suitableTitle);
      renderList("home-suitable-list", content.home.suitableItems);
      setText("home-suitable-text", content.home.suitableText);

      setText("home-process-title", content.home.processTitle);
      setText("home-process-text1", content.home.processText1);
      renderList("home-process-list", content.home.processItems);
      setText("home-process-text2", content.home.processText2);
    }

    if (hasServicesContent && content.services) {
      setText("services-title", content.services.title);
      setText("services-intro", content.services.intro);
      setText("services-cta-title", content.services.ctaTitle);
      setText("services-cta-text", content.services.ctaText);

      renderServicesBoxes(content.services.boxes || []);
    }

    if (hasAboutContent && content.about) {
      const aboutImage = document.getElementById("about-image");

      setText("about-title", content.about.title);
      renderParagraphs("about-short-texts", content.about.shortTexts || []);
      renderParagraphs("about-long-texts", content.about.longTexts || []);

      if (aboutImage && content.about.image) {
        aboutImage.src = content.about.image;
      }
    }

    if (hasTherapyMethodsContent && content.therapyMethods) {
      setText("therapy-methods-main-title", content.therapyMethods.mainTitle);
      setText("therapy-methods-main-text", content.therapyMethods.mainText);

      if (Array.isArray(content.therapyMethods.methods)) {
        content.therapyMethods.methods.forEach((method) => {
          setText(`therapy-${method.key}-title`, method.title);
          setText(`therapy-${method.key}-text`, method.text);

          const image = document.getElementById(`therapy-${method.key}-image`);

          if (image && method.image) {
            image.src = method.image;
          }
        });
      }
    }

    if (hasFooterContent && content.footer) {
      setText("footer-address-title", content.footer.addressTitle);
      setText("footer-address-line-1", content.footer.addressLine1);
      setText("footer-address-line-2", content.footer.addressLine2);
      setText("footer-center-name", content.footer.centerName);
      setText("footer-doctor-title", content.footer.doctorTitle);

      const footerPhone = document.getElementById("footer-phone");
      const footerEmail = document.getElementById("footer-email");

      if (footerPhone) {
        footerPhone.textContent = content.footer.phone || "";
        footerPhone.href = `tel:${content.footer.phoneHref || content.footer.phone || "#"}`;
      }

      if (footerEmail) {
        footerEmail.textContent = content.footer.email || "";
        footerEmail.href = `mailto:${content.footer.email || ""}`;
      }
    }
  } catch (error) {
    console.log("İçerik yüklenemedi.");
  }
}

function renderServicesBoxes(boxes) {
  const container = document.getElementById("services-boxes");

  if (!container) return;

  container.innerHTML = "";

  boxes.forEach((box) => {
    const serviceBox = document.createElement("div");
    serviceBox.className = "service-box";

    const title = document.createElement("h2");
    title.textContent = box.title || "";

    const text = document.createElement("p");
    text.textContent = box.text || "";

    const buttons = document.createElement("div");
    buttons.className = "service-box-buttons";

    if (Array.isArray(box.buttons)) {
      box.buttons.forEach((button) => {
        const a = document.createElement("a");
        a.href = button.href || "#";
        a.textContent = button.label || "Hizmet";
        buttons.appendChild(a);
      });
    }

    serviceBox.appendChild(title);
    serviceBox.appendChild(text);
    serviceBox.appendChild(buttons);

    container.appendChild(serviceBox);
  });
}

loadPublicContent();

/* ---------- APPOINTMENT FORM ---------- */

const appointmentForm = document.getElementById("appointment-form");

if (appointmentForm) {
  appointmentForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const appointment = {
      ad: document.getElementById("ad").value.trim(),
      soyad: document.getElementById("soyad").value.trim(),
      email: document.getElementById("email").value.trim(),
      telefon: document.getElementById("telefon").value.trim(),
      yas: document.getElementById("yas").value.trim(),
      mesaj: document.getElementById("mesaj").value.trim()
    };

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appointment)
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Randevu kaydedilemedi.");
        return;
      }

      alert(result.message || "Randevu talebiniz başarıyla kaydedildi.");
      appointmentForm.reset();
    } catch (error) {
      alert("Sunucuya bağlanılamadı.");
    }
  });
}

/* ---------- ADMIN ---------- */

const adminLogin = document.getElementById("admin-login");
const adminContent = document.getElementById("admin-content");
const adminLoginForm = document.getElementById("admin-login-form");
const adminPasswordInput = document.getElementById("admin-password");
const adminError = document.getElementById("admin-error");
const adminLogout = document.getElementById("admin-logout");
const appointmentsList = document.getElementById("appointments-list");
const clearAppointmentsBtn = document.getElementById("clear-appointments");

const contentEditor = document.getElementById("content-editor");
const saveContentBtn = document.getElementById("save-content");
const contentSaveMessage = document.getElementById("content-save-message");

const adminTabs = document.querySelectorAll(".admin-tab");
const adminTabPanels = document.querySelectorAll(".admin-tab-panel");

const changePasswordForm = document.getElementById("change-password-form");
const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const newPasswordRepeatInput = document.getElementById("new-password-repeat");
const passwordChangeMessage = document.getElementById("password-change-message");


let currentContent = null;

function showAdminLogin() {
  if (!adminLogin || !adminContent) return;

  adminLogin.style.display = "block";
  adminContent.style.display = "none";
}

function showAdminContent() {
  if (!adminLogin || !adminContent) return;

  adminLogin.style.display = "none";
  adminContent.style.display = "block";
}

async function checkAdminLogin() {
  if (!adminLogin || !adminContent) return;

  try {
    const response = await fetch("/api/check-auth");
    const result = await response.json();

    if (result.authenticated) {
      showAdminContent();
      renderAppointments();
      loadAdminContent();
    } else {
      showAdminLogin();
    }
  } catch (error) {
    showAdminLogin();
  }
}

if (adminLogin || adminContent) {
  checkAdminLogin();
}

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password: adminPasswordInput.value.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        adminError.textContent = result.message || "Şifre hatalı.";
        adminPasswordInput.value = "";
        return;
      }

      adminError.textContent = "";
      adminPasswordInput.value = "";

      showAdminContent();
      renderAppointments();
      loadAdminContent();
    } catch (error) {
      adminError.textContent = "Sunucuya bağlanılamadı.";
    }
  });
}

if (adminLogout) {
  adminLogout.addEventListener("click", async () => {
    await fetch("/api/logout", {
      method: "POST"
    });

    showAdminLogin();
  });
}

/* ---------- ADMIN APPOINTMENTS ---------- */

async function renderAppointments() {
  if (!appointmentsList) return;

  try {
    const response = await fetch("/api/appointments");

    if (response.status === 401) {
      showAdminLogin();
      return;
    }

    const appointments = await response.json();

    if (appointments.length === 0) {
      appointmentsList.innerHTML = `
        <div class="empty-admin">
          Henüz randevu talebi yok.
        </div>
      `;
      return;
    }

    appointmentsList.innerHTML = appointments
      .map((item) => {
        return `
          <div class="appointment-card">
            <div class="appointment-card-top">
              <h2>${escapeHTML(item.ad)} ${escapeHTML(item.soyad)}</h2>
              <span>${escapeHTML(item.tarih)}</span>
            </div>

            <p><strong>E-posta:</strong> ${escapeHTML(item.email)}</p>
            <p><strong>Telefon:</strong> ${escapeHTML(item.telefon)}</p>
            <p><strong>Yaş:</strong> ${escapeHTML(item.yas) || "-"}</p>

            <p class="appointment-message">
              <strong>Mesaj:</strong><br>
              ${escapeHTML(item.mesaj) || "-"}
            </p>

            <button class="delete-appointment" type="button" data-id="${item.id}">
              Sil
            </button>
          </div>
        `;
      })
      .join("");

    document.querySelectorAll(".delete-appointment").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;

        await fetch(`/api/appointments/${id}`, {
          method: "DELETE"
        });

        renderAppointments();
      });
    });
  } catch (error) {
    appointmentsList.innerHTML = `
      <div class="empty-admin">
        Randevular yüklenemedi.
      </div>
    `;
  }
}

if (clearAppointmentsBtn) {
  clearAppointmentsBtn.addEventListener("click", async () => {
    const confirmDelete = confirm(
      "Tüm randevu taleplerini silmek istediğine emin misin?"
    );

    if (!confirmDelete) return;

    await fetch("/api/appointments", {
      method: "DELETE"
    });

    renderAppointments();
  });
}

/* ---------- ADMIN CONTENT EDITOR ---------- */

async function loadAdminContent() {
  if (!contentEditor) return;

  try {
    const response = await fetch("/api/admin/content");

    if (response.status === 401) {
      showAdminLogin();
      return;
    }

    currentContent = await response.json();
    renderContentEditor();
    fillTherapyMethodsAdminFields();
  } catch (error) {
    contentEditor.innerHTML = `
      <div class="empty-admin">
        İçerik yönetimi yüklenemedi.
      </div>
    `;
  }
}

function renderContentEditor() {
  if (!contentEditor || !currentContent) return;

  contentEditor.innerHTML = `
    <div class="cms-block">
      <h3>Anasayfa Hero Alanı</h3>

      <label>Hero Başlığı</label>
      <textarea id="cms-hero-title">${escapeHTML(currentContent.home.heroTitle)}</textarea>

      <label>Hero Açıklama 1</label>
      <textarea id="cms-hero-p1">${escapeHTML(currentContent.home.heroParagraph1)}</textarea>

      <label>Hero Açıklama 2</label>
      <textarea id="cms-hero-p2">${escapeHTML(currentContent.home.heroParagraph2)}</textarea>
    </div>

    <div class="cms-block">
      <h3>Anasayfa: Kimler İçin Uygun?</h3>

      <label>Bölüm Başlığı</label>
      <textarea id="cms-suitable-title">${escapeHTML(currentContent.home.suitableTitle)}</textarea>

      <label>Madde Listesi - her satır bir madde</label>
      <textarea id="cms-suitable-items">${escapeHTML((currentContent.home.suitableItems || []).join("\n"))}</textarea>

      <label>Açıklama</label>
      <textarea id="cms-suitable-text">${escapeHTML(currentContent.home.suitableText)}</textarea>
    </div>

    <div class="cms-block">
      <h3>Anasayfa: Terapi Süreci</h3>

      <label>Bölüm Başlığı</label>
      <textarea id="cms-process-title">${escapeHTML(currentContent.home.processTitle)}</textarea>

      <label>Giriş Metni</label>
      <textarea id="cms-process-text1">${escapeHTML(currentContent.home.processText1)}</textarea>

      <label>Madde Listesi - her satır bir madde</label>
      <textarea id="cms-process-items">${escapeHTML((currentContent.home.processItems || []).join("\n"))}</textarea>

      <label>Kapanış Metni</label>
      <textarea id="cms-process-text2">${escapeHTML(currentContent.home.processText2)}</textarea>
    </div>

    <div class="cms-block">
      <h3>Hakkımda Sayfası</h3>

      <label>Hakkımda Başlığı</label>
      <textarea id="cms-about-title">${escapeHTML(currentContent.about?.title || "")}</textarea>

      <label>Görsel Yolu</label>
      <input type="text" id="cms-about-image" value="${escapeHTML(currentContent.about?.image || "assets/about.jpg")}">

      <label>Sağdaki Kısa Paragraflar - her satır bir paragraf</label>
      <textarea id="cms-about-short-texts">${escapeHTML((currentContent.about?.shortTexts || []).join("\n"))}</textarea>

      <label>Alttaki Uzun Paragraflar - her satır bir paragraf</label>
      <textarea id="cms-about-long-texts">${escapeHTML((currentContent.about?.longTexts || []).join("\n"))}</textarea>
    </div>

    <div class="cms-block">
      <h3>Alt Bilgi / İletişim</h3>

      <label>Adres Başlığı</label>
      <input type="text" id="cms-footer-address-title" value="${escapeHTML(currentContent.footer?.addressTitle || "Adres;")}">

      <label>Adres Satırı 1</label>
      <input type="text" id="cms-footer-address-line-1" value="${escapeHTML(currentContent.footer?.addressLine1 || "")}">

      <label>Adres Satırı 2</label>
      <input type="text" id="cms-footer-address-line-2" value="${escapeHTML(currentContent.footer?.addressLine2 || "")}">

      <label>Merkez Adı</label>
      <input type="text" id="cms-footer-center-name" value="${escapeHTML(currentContent.footer?.centerName || "")}">

      <label>Ünvan / İsim</label>
      <textarea id="cms-footer-doctor-title">${escapeHTML(currentContent.footer?.doctorTitle || "")}</textarea>

      <label>Telefon Görünen Metin</label>
      <input type="text" id="cms-footer-phone" value="${escapeHTML(currentContent.footer?.phone || "")}">

      <label>Telefon Link Değeri</label>
      <input type="text" id="cms-footer-phone-href" value="${escapeHTML(currentContent.footer?.phoneHref || "")}">

      <label>E-posta</label>
      <input type="text" id="cms-footer-email" value="${escapeHTML(currentContent.footer?.email || "")}">
    </div>

    <div class="cms-block">
      <h3>Hizmetler Sayfası</h3>

      <label>Hizmetler Başlığı</label>
      <textarea id="cms-services-title">${escapeHTML(currentContent.services.title)}</textarea>

      <label>Hizmetler Giriş Yazısı</label>
      <textarea id="cms-services-intro">${escapeHTML(currentContent.services.intro)}</textarea>

      <label>CTA Başlığı</label>
      <textarea id="cms-services-cta-title">${escapeHTML(currentContent.services.ctaTitle)}</textarea>

      <label>CTA Açıklaması</label>
      <textarea id="cms-services-cta-text">${escapeHTML(currentContent.services.ctaText)}</textarea>
    </div>

    <div class="cms-block">
      <div class="cms-title-row">
        <h3>Hizmet Kutuları</h3>
        <button type="button" id="add-service-box">Yeni Hizmet Kutusu Ekle</button>
      </div>

      <div id="cms-service-boxes"></div>
    </div>
  `;

  renderAdminServiceBoxes();

  const addServiceBoxBtn = document.getElementById("add-service-box");

  if (addServiceBoxBtn) {
    addServiceBoxBtn.addEventListener("click", () => {
      currentContent.services.boxes.push({
        id: Date.now(),
        title: "Yeni Hizmet Başlığı",
        text: "Yeni hizmet açıklaması",
        buttons: []
      });

      renderContentEditor();
    });
  }
}

function renderAdminServiceBoxes() {
  const container = document.getElementById("cms-service-boxes");

  if (!container || !currentContent) return;

  container.innerHTML = "";

  currentContent.services.boxes.forEach((box, boxIndex) => {
    const boxElement = document.createElement("div");
    boxElement.className = "cms-service-box";

    boxElement.innerHTML = `
      <label>Hizmet Kutusu Başlığı</label>
      <input type="text" class="cms-box-title" data-index="${boxIndex}" value="${escapeHTML(box.title)}">

      <label>Hizmet Kutusu Açıklaması</label>
      <textarea class="cms-box-text" data-index="${boxIndex}">${escapeHTML(box.text)}</textarea>

      <div class="cms-title-row">
        <h4>Butonlar</h4>
        <button type="button" class="add-service-button" data-index="${boxIndex}">
          Buton Ekle
        </button>
      </div>

      <div class="cms-buttons-list">
        ${(box.buttons || [])
          .map((button, buttonIndex) => {
            return `
              <div class="cms-button-item">
                <input
                  type="text"
                  class="cms-button-label"
                  data-box-index="${boxIndex}"
                  data-button-index="${buttonIndex}"
                  placeholder="Buton adı"
                  value="${escapeHTML(button.label)}"
                >

                <input
                  type="text"
                  class="cms-button-href"
                  data-box-index="${boxIndex}"
                  data-button-index="${buttonIndex}"
                  placeholder="sayfa.html"
                  value="${escapeHTML(button.href)}"
                >

                <button
                  type="button"
                  class="delete-service-button"
                  data-box-index="${boxIndex}"
                  data-button-index="${buttonIndex}"
                >
                  Sil
                </button>
              </div>
            `;
          })
          .join("")}
      </div>

      <button type="button" class="delete-service-box" data-index="${boxIndex}">
        Bu Hizmet Kutusunu Sil
      </button>
    `;

    container.appendChild(boxElement);
  });

  document.querySelectorAll(".cms-box-title").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.index);
      currentContent.services.boxes[index].title = input.value;
    });
  });

  document.querySelectorAll(".cms-box-text").forEach((textarea) => {
    textarea.addEventListener("input", () => {
      const index = Number(textarea.dataset.index);
      currentContent.services.boxes[index].text = textarea.value;
    });
  });

  document.querySelectorAll(".add-service-button").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);

      currentContent.services.boxes[index].buttons.push({
        id: Date.now(),
        label: "Yeni Buton",
        href: "#"
      });

      renderContentEditor();
    });
  });

  document.querySelectorAll(".delete-service-box").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);

      const confirmDelete = confirm("Bu hizmet kutusunu silmek istediğine emin misin?");

      if (!confirmDelete) return;

      currentContent.services.boxes.splice(index, 1);
      renderContentEditor();
    });
  });

  document.querySelectorAll(".cms-button-label").forEach((input) => {
    input.addEventListener("input", () => {
      const boxIndex = Number(input.dataset.boxIndex);
      const buttonIndex = Number(input.dataset.buttonIndex);

      currentContent.services.boxes[boxIndex].buttons[buttonIndex].label = input.value;
    });
  });

  document.querySelectorAll(".cms-button-href").forEach((input) => {
    input.addEventListener("input", () => {
      const boxIndex = Number(input.dataset.boxIndex);
      const buttonIndex = Number(input.dataset.buttonIndex);

      currentContent.services.boxes[boxIndex].buttons[buttonIndex].href = input.value;
    });
  });

  document.querySelectorAll(".delete-service-button").forEach((button) => {
    button.addEventListener("click", () => {
      const boxIndex = Number(button.dataset.boxIndex);
      const buttonIndex = Number(button.dataset.buttonIndex);

      currentContent.services.boxes[boxIndex].buttons.splice(buttonIndex, 1);
      renderContentEditor();
    });
  });
}


function fillTherapyMethodsAdminFields() {
  if (!currentContent || !currentContent.therapyMethods) return;

  const mainTitle = document.getElementById("therapy-methods-main-title");
  const mainText = document.getElementById("therapy-methods-main-text");

  if (mainTitle) mainTitle.value = currentContent.therapyMethods.mainTitle || "";
  if (mainText) mainText.value = currentContent.therapyMethods.mainText || "";

  const methods = Array.isArray(currentContent.therapyMethods.methods)
    ? currentContent.therapyMethods.methods
    : [];

  methods.forEach((method) => {
    const title = document.getElementById(`therapy-${method.key}-title`);
    const text = document.getElementById(`therapy-${method.key}-text`);
    const image = document.getElementById(`therapy-${method.key}-image`);

    if (title) title.value = method.title || "";
    if (text) text.value = method.text || "";
    if (image) image.value = method.image || "";
  });
}

function collectTherapyMethodsAdminFields() {
  if (!currentContent) return;

  const getValue = (id) => {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
  };

  const keys = ["bdt", "emdr", "solution", "psychodynamic", "act"];

  currentContent.therapyMethods = {
    mainTitle: getValue("therapy-methods-main-title"),
    mainText: getValue("therapy-methods-main-text"),
    methods: keys.map((key) => ({
      key,
      title: getValue(`therapy-${key}-title`),
      text: getValue(`therapy-${key}-text`),
      image: getValue(`therapy-${key}-image`)
    }))
  };
}


function collectContentEditorValues() {
  if (!currentContent) return;

  currentContent.home.heroTitle = document.getElementById("cms-hero-title").value.trim();
  currentContent.home.heroParagraph1 = document.getElementById("cms-hero-p1").value.trim();
  currentContent.home.heroParagraph2 = document.getElementById("cms-hero-p2").value.trim();

  currentContent.home.suitableTitle = document.getElementById("cms-suitable-title").value.trim();
  currentContent.home.suitableItems = document
    .getElementById("cms-suitable-items")
    .value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  currentContent.home.suitableText = document.getElementById("cms-suitable-text").value.trim();

  currentContent.home.processTitle = document.getElementById("cms-process-title").value.trim();
  currentContent.home.processText1 = document.getElementById("cms-process-text1").value.trim();
  currentContent.home.processItems = document
    .getElementById("cms-process-items")
    .value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  currentContent.home.processText2 = document.getElementById("cms-process-text2").value.trim();

  currentContent.about = {
    title: document.getElementById("cms-about-title").value.trim(),
    image: document.getElementById("cms-about-image").value.trim(),
    shortTexts: document
      .getElementById("cms-about-short-texts")
      .value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    longTexts: document
      .getElementById("cms-about-long-texts")
      .value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
  };

  currentContent.footer = {
    addressTitle: document.getElementById("cms-footer-address-title").value.trim(),
    addressLine1: document.getElementById("cms-footer-address-line-1").value.trim(),
    addressLine2: document.getElementById("cms-footer-address-line-2").value.trim(),
    centerName: document.getElementById("cms-footer-center-name").value.trim(),
    doctorTitle: document.getElementById("cms-footer-doctor-title").value.trim(),
    phone: document.getElementById("cms-footer-phone").value.trim(),
    phoneHref: document.getElementById("cms-footer-phone-href").value.trim(),
    email: document.getElementById("cms-footer-email").value.trim()
  };

  currentContent.services.title = document.getElementById("cms-services-title").value.trim();
  currentContent.services.intro = document.getElementById("cms-services-intro").value.trim();
  currentContent.services.ctaTitle = document.getElementById("cms-services-cta-title").value.trim();
  currentContent.services.ctaText = document.getElementById("cms-services-cta-text").value.trim();

  const serviceBoxes = [];

  document.querySelectorAll(".cms-service-box").forEach((boxElement) => {
    const titleInput = boxElement.querySelector(".cms-box-title");
    const textInput = boxElement.querySelector(".cms-box-text");

    const buttons = [];

    boxElement.querySelectorAll(".cms-button-item").forEach((buttonElement) => {
      const labelInput = buttonElement.querySelector(".cms-button-label");
      const hrefInput = buttonElement.querySelector(".cms-button-href");

      if (!labelInput || !hrefInput) return;

      buttons.push({
        id: Date.now() + Math.floor(Math.random() * 100000),
        label: labelInput.value.trim(),
        href: hrefInput.value.trim()
      });
    });

    serviceBoxes.push({
      id: Date.now() + Math.floor(Math.random() * 100000),
      title: titleInput ? titleInput.value.trim() : "",
      text: textInput ? textInput.value.trim() : "",
      buttons: buttons
    });
  });

  currentContent.services.boxes = serviceBoxes;
}

if (saveContentBtn) {
  saveContentBtn.addEventListener("click", async () => {
    if (!currentContent) return;

    collectContentEditorValues();
    collectTherapyMethodsAdminFields();

    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(currentContent)
      });

      const result = await response.json();

      if (!response.ok) {
        contentSaveMessage.textContent = result.message || "İçerik kaydedilemedi.";
        contentSaveMessage.style.color = "#a00000";
        return;
      }

      contentSaveMessage.textContent = "İçerik başarıyla kaydedildi.";
      contentSaveMessage.style.color = "#166534";
    } catch (error) {
      contentSaveMessage.textContent = "Sunucuya bağlanılamadı.";
      contentSaveMessage.style.color = "#a00000";
    }
  });
}

/* ---------- ADMIN TABS ---------- */

if (adminTabs.length > 0) {
  adminTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab;

      adminTabs.forEach((item) => {
        item.classList.remove("active");
      });

      adminTabPanels.forEach((panel) => {
        panel.classList.remove("active");
      });

      tab.classList.add("active");

      const activePanel = document.getElementById(`tab-${targetTab}`);

      if (activePanel) {
        activePanel.classList.add("active");
      }
    });
  });
}

/* ---------- CHANGE PASSWORD ---------- */

if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const newPasswordRepeat = newPasswordRepeatInput.value.trim();

    if (newPassword.length < 6) {
      passwordChangeMessage.textContent = "Yeni şifre en az 6 karakter olmalı.";
      passwordChangeMessage.style.color = "#a00000";
      return;
    }

    if (newPassword !== newPasswordRepeat) {
      passwordChangeMessage.textContent = "Yeni şifreler eşleşmiyor.";
      passwordChangeMessage.style.color = "#a00000";
      return;
    }

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        passwordChangeMessage.textContent = result.message || "Şifre değiştirilemedi.";
        passwordChangeMessage.style.color = "#a00000";
        return;
      }

      passwordChangeMessage.textContent = result.message || "Şifre başarıyla değiştirildi.";
      passwordChangeMessage.style.color = "#166534";

      changePasswordForm.reset();
    } catch (error) {
      passwordChangeMessage.textContent = "Sunucuya bağlanılamadı.";
      passwordChangeMessage.style.color = "#a00000";
    }
  });
}

