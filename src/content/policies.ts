export interface PolicySection {
  h: { ar: string; en: string };
  body: { ar: string[]; en: string[] };
}

export interface PolicyDoc {
  slug: string;
  title: { ar: string; en: string };
  intro: { ar: string; en: string };
  sections: PolicySection[];
}

export const POLICIES: Record<'return' | 'terms' | 'cancellation' | 'privacy', PolicyDoc> = {
  return: {
    slug: 'return-policy',
    title: { ar: 'سياسة الاسترجاع والاستبدال', en: 'Return & Exchange Policy' },
    intro: {
      ar: 'في EmadGad هدفنا إنك تكون مبسوط من كل طلب. لو حصل أي مشكلة في المنتج اللي وصلك، دي سياسة الاسترجاع والاستبدال بتاعتنا.',
      en: 'At EmadGad our goal is for you to be happy with every order. If anything goes wrong with the product you received, this is our return and exchange policy.',
    },
    sections: [
      {
        h: { ar: 'مدة الاسترجاع', en: 'Return window' },
        body: {
          ar: [
            'تقدر تطلب استرجاع أو استبدال المنتج خلال ١٤ يوم من تاريخ استلام الطلب.',
            'لازم تقدم طلب الاسترجاع من صفحة الطلبات في حسابك أو عن طريق خدمة العملاء قبل ما ترجع المنتج.',
          ],
          en: [
            'You may request a return or exchange within 14 days of receiving your order.',
            'You must submit the return request from the orders page in your account or through customer service before sending the product back.',
          ],
        },
      },
      {
        h: { ar: 'شروط الاسترجاع', en: 'Return conditions' },
        body: {
          ar: [
            'المنتج يكون في حالته الأصلية: غير مستخدم وغير متركب وبكل التغليف والملصقات الأصلية.',
            'الإطارات والبطاريات اللي اتّركبت على العربية أو اتستخدمت على الطريق مش بتترجع.',
            'الزيوت والسوائل المفتوحة أو المستخدمة غير قابلة للاسترجاع حفاظًا على سلامتك.',
            'لازم إرفاق الفاتورة أو رقم الطلب مع المنتج المرتجع.',
          ],
          en: [
            'The product must be in its original condition: unused, uninstalled, and with all original packaging and labels.',
            'Tires and batteries that have been mounted on a vehicle or used on the road cannot be returned.',
            'Opened or used oils and fluids are not eligible for return for safety reasons.',
            'The invoice or order number must be included with the returned product.',
          ],
        },
      },
      {
        h: { ar: 'المنتجات المعيبة أو الغلط', en: 'Defective or wrong items' },
        body: {
          ar: [
            'لو وصلك منتج فيه عيب مصنعي أو مختلف عن اللي طلبته، بنسترجعه أو نستبدله على حسابنا بالكامل ومن غير أي رسوم شحن.',
            'العيوب المصنعية في الإطارات والبطاريات بتتغطي بضمان الماركة، وفريقنا بيساعدك في إجراءات الضمان مع الوكيل.',
          ],
          en: [
            'If you received a product with a manufacturing defect or different from what you ordered, we will return or exchange it fully at our expense with no shipping fees.',
            'Manufacturing defects in tires and batteries are covered by the brand warranty, and our team will help you with the warranty claim with the agent.',
          ],
        },
      },
      {
        h: { ar: 'استرداد المبلغ', en: 'Refunds' },
        body: {
          ar: [
            'بعد ما نستلم المنتج المرتجع ونراجع حالته، بنحوّل المبلغ على نفس وسيلة الدفع اللي اتدفع بيها الطلب.',
            'المبالغ المدفوعة بالبطاقة أو المحفظة بترجع خلال ٥ إلى ١٠ أيام عمل حسب البنك.',
            'المبالغ المدفوعة كاش بترجع عن طريق تحويل بنكي أو محفظة إلكترونية بعد تأكيد بياناتك.',
          ],
          en: [
            'Once we receive the returned product and inspect its condition, we refund the amount to the same payment method used for the order.',
            'Card and wallet payments are refunded within 5 to 10 business days depending on your bank.',
            'Cash payments are refunded via bank transfer or e-wallet after confirming your details.',
          ],
        },
      },
      {
        h: { ar: 'تكلفة شحن الاسترجاع', en: 'Return shipping cost' },
        body: {
          ar: [
            'لو الاسترجاع بسبب غلط منا أو منتج معيب، الشحن علينا بالكامل.',
            'لو الاسترجاع لأي سبب تاني، بتتحمل رسوم الشحن للفرع أو المخزن وبتتخصم من المبلغ المسترد.',
          ],
          en: [
            'If the return is due to our mistake or a defective product, shipping is fully on us.',
            'For any other reason, you cover the shipping fee to the branch or warehouse, which is deducted from the refunded amount.',
          ],
        },
      },
    ],
  },

  terms: {
    slug: 'terms',
    title: { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
    intro: {
      ar: 'باستخدامك موقع أو تطبيق EmadGad أو بطلبك أي منتج أو خدمة منا، إنت بتوافق على الشروط والأحكام دي. لو مش موافق على أي بند، من فضلك متستخدمش خدماتنا.',
      en: 'By using the EmadGad website or app, or ordering any product or service from us, you agree to these terms and conditions. If you do not agree with any clause, please do not use our services.',
    },
    sections: [
      {
        h: { ar: 'استخدام الموقع', en: 'Use of the website' },
        body: {
          ar: [
            'الموقع مخصص لعرض وبيع منتجات وخدمات EmadGad داخل مصر، واستخدامه لأي غرض تاني أو غير قانوني ممنوع.',
            'إنت مسؤول عن دقة البيانات اللي بتدخلها زي رقم الموبايل والعنوان وبيانات العربية.',
          ],
          en: [
            'The website is dedicated to displaying and selling EmadGad products and services within Egypt; using it for any other or illegal purpose is prohibited.',
            'You are responsible for the accuracy of the data you enter, such as your mobile number, address, and vehicle details.',
          ],
        },
      },
      {
        h: { ar: 'الأسعار والتوفر', en: 'Prices and availability' },
        body: {
          ar: [
            'الأسعار المعروضة بالجنيه المصري وشاملة الضريبة إلا لو اتذكر غير كده.',
            'الأسعار والعروض والمخزون ممكن تتغير في أي وقت من غير إشعار مسبق، والسعر المعتمد هو سعر وقت تأكيد الطلب.',
            'في حالة خطأ واضح في سعر منتج، يحق لنا إلغاء الطلب ورد كامل المبلغ المدفوع.',
          ],
          en: [
            'Displayed prices are in Egyptian pounds and include VAT unless stated otherwise.',
            'Prices, offers, and stock may change at any time without prior notice; the binding price is the one at the time of order confirmation.',
            'In case of a clear pricing error on a product, we reserve the right to cancel the order and refund the full paid amount.',
          ],
        },
      },
      {
        h: { ar: 'الطلبات والدفع', en: 'Orders and payment' },
        body: {
          ar: [
            'الطلب بيعتبر مؤكد بعد ما توصلك رسالة تأكيد على الموقع أو الواتساب.',
            'طرق الدفع المتاحة بتظهر في صفحة إتمام الطلب وممكن تختلف حسب الفرع أو نوع الخدمة.',
            'يحق لنا رفض أو إلغاء أي طلب في حالات الاشتباه في احتيال أو عدم توفر المنتج، مع رد أي مبلغ مدفوع.',
          ],
          en: [
            'An order is considered confirmed once you receive a confirmation message on the website or WhatsApp.',
            'Available payment methods appear on the checkout page and may vary by branch or service type.',
            'We reserve the right to refuse or cancel any order in cases of suspected fraud or product unavailability, with a full refund of any paid amount.',
          ],
        },
      },
      {
        h: { ar: 'الحجوزات والخدمات', en: 'Bookings and services' },
        body: {
          ar: [
            'مواعيد الحجز تقديرية وممكن تتأثر بضغط العمل في الفرع أو ظروف الطريق للخدمة المتنقلة.',
            'الخدمة المتنقلة متاحة في نطاق التغطية المعلن لكل فرع، وممكن تترتب رسوم انتقال إضافية حسب المسافة.',
          ],
          en: [
            'Booking times are estimates and may be affected by branch workload or road conditions for mobile service.',
            'Mobile service is available within the announced coverage of each branch, and extra travel fees may apply depending on distance.',
          ],
        },
      },
      {
        h: { ar: 'الضمان', en: 'Warranty' },
        body: {
          ar: [
            'ضمان المنتجات بيخضع لشروط ضمان كل ماركة، وفاتورة الشراء هي مستند الضمان المعتمد.',
            'الضمان مش بيغطي التلف الناتج عن سوء الاستخدام أو التركيب الغلط أو الحوادث.',
          ],
          en: [
            'Product warranty is subject to each brand\'s warranty terms, and the purchase invoice is the official warranty document.',
            'Warranty does not cover damage caused by misuse, incorrect installation, or accidents.',
          ],
        },
      },
      {
        h: { ar: 'حدود المسؤولية', en: 'Limitation of liability' },
        body: {
          ar: [
            'EmadGad مش مسؤولة عن أي أضرار غير مباشرة ناتجة عن استخدام الموقع أو تأخير خارج عن سيطرتنا.',
            'في كل الأحوال، مسؤوليتنا القصوى بتتحدد بقيمة الطلب أو الخدمة موضوع المطالبة.',
          ],
          en: [
            'EmadGad is not liable for any indirect damages arising from use of the website or delays beyond our control.',
            'In all cases, our maximum liability is limited to the value of the order or service in question.',
          ],
        },
      },
      {
        h: { ar: 'القانون المطبق', en: 'Governing law' },
        body: {
          ar: [
            'الشروط دي بتخضع لقوانين جمهورية مصر العربية، وأي نزاع بيتحل وديًا أولًا ولو تعذر يبقى أمام المحاكم المصرية المختصة.',
          ],
          en: [
            'These terms are governed by the laws of the Arab Republic of Egypt; disputes are resolved amicably first, otherwise before the competent Egyptian courts.',
          ],
        },
      },
    ],
  },

  cancellation: {
    slug: 'cancellation-policy',
    title: { ar: 'سياسة الإلغاء', en: 'Cancellation Policy' },
    intro: {
      ar: 'عارفين إن الظروف بتتغير — دي سياسة إلغاء الطلبات والحجوزات في EmadGad.',
      en: 'We know plans change — this is the cancellation policy for orders and bookings at EmadGad.',
    },
    sections: [
      {
        h: { ar: 'إلغاء الطلبات', en: 'Order cancellation' },
        body: {
          ar: [
            'تقدر تلغي طلبك مجانًا في أي وقت قبل ما يتجهز للشحن أو التسليم للفرع.',
            'بعد ما الطلب يتشحن أو يتسلم للفرع للتركيب، الإلغاء بيترتب عليه رسوم شحن/تحضير بتتحدد حسب حالة الطلب.',
            'الطلبات اللي اتدفعت أونلاين بيرجع مبلغها على نفس وسيلة الدفع خلال ٥ إلى ١٠ أيام عمل.',
          ],
          en: [
            'You can cancel your order free of charge at any time before it is prepared for shipping or handed to the branch.',
            'Once the order is shipped or delivered to the branch for installation, cancellation incurs shipping/preparation fees depending on the order status.',
            'Orders paid online are refunded to the same payment method within 5 to 10 business days.',
          ],
        },
      },
      {
        h: { ar: 'إلغاء الحجوزات', en: 'Booking cancellation' },
        body: {
          ar: [
            'حجوزات الخدمات في الفرع بتتلغي مجانًا في أي وقت قبل موعد الحجز من صفحة الحجوزات أو بالاتصال بالفرع.',
            'للخدمة المتنقلة، لو الفني اتحرك للعنوان بالفعل ممكن تترتب رسوم انتقال قبل الإلغاء.',
          ],
          en: [
            'Branch service bookings can be cancelled free of charge any time before the appointment, from the bookings page or by calling the branch.',
            'For mobile service, if the technician has already headed to your address, a travel fee may apply before cancellation.',
          ],
        },
      },
      {
        h: { ar: 'ما لا يمكن إلغاؤه', en: 'Non-cancellable items' },
        body: {
          ar: [
            'الخدمات اللي اتنفذت بالفعل أو بدأ تنفيذها مش بتتلغي.',
            'المنتجات اللي اتطلبت خصيصًا أو اتقصّت/اتجهّزت على مقاس عربيتك مش بتتلغي بعد التجهيز.',
          ],
          en: [
            'Services that have already been performed or started cannot be cancelled.',
            'Products specially ordered or prepared to your vehicle\'s specification cannot be cancelled after preparation.',
          ],
        },
      },
      {
        h: { ar: 'عدم الحضور', en: 'No-show' },
        body: {
          ar: [
            'لو مش حضرت لموعد الحجز من غير إلغاء، يحق لنا إلغاء الحجز وتقييد الحجوزات المستقبلية لو تكرر.',
          ],
          en: [
            'If you do not show up for your booking without cancelling, we may cancel the booking and restrict future bookings if it recurs.',
          ],
        },
      },
      {
        h: { ar: 'إلغاء من طرفنا', en: 'Cancellation by us' },
        body: {
          ar: [
            'في حالات زي عدم توفر المنتج أو ظروف تشغيلية طارئة، ممكن نلغي الطلب أو الحجز وهنوافيك بالسبب ونرد أي مبلغ مدفوع بالكامل.',
          ],
          en: [
            'In cases such as product unavailability or urgent operational circumstances, we may cancel the order or booking, inform you of the reason, and fully refund any paid amount.',
          ],
        },
      },
    ],
  },

  privacy: {
    slug: 'privacy-policy',
    title: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    intro: {
      ar: 'خصوصيتك مهمة بالنسبة لنا. الصفحة دي بتوضح إيه البيانات اللي بنجمعها في EmadGad وليه وإزاي بنحميها.',
      en: 'Your privacy matters to us. This page explains what data EmadGad collects, why, and how we protect it.',
    },
    sections: [
      {
        h: { ar: 'البيانات اللي بنجمعها', en: 'Data we collect' },
        body: {
          ar: [
            'بيانات الحساب: الاسم ورقم الموبايل والبريد الإلكتروني.',
            'بيانات العربية: الماركة والموديل والمقاسات عشان نرشح المنتجات المناسبة.',
            'بيانات الطلبات: العنوان وطريقة الدفع وتفاصيل المنتجات المطلوبة.',
            'بيانات تقنية: نوع الجهاز والمتصفح وسجل الاستخدام لتحسين تجربة الموقع.',
          ],
          en: [
            'Account data: name, mobile number, and email address.',
            'Vehicle data: make, model, and sizes so we can recommend suitable products.',
            'Order data: address, payment method, and details of ordered products.',
            'Technical data: device type, browser, and usage logs to improve the website experience.',
          ],
        },
      },
      {
        h: { ar: 'إزاي بنستخدم بياناتك', en: 'How we use your data' },
        body: {
          ar: [
            'تنفيذ الطلبات والحجوزات والتوصيل والتركيب.',
            'التواصل معاك بخصوص الطلب أو الخدمة أو العروض اللي اخترت متابعتها.',
            'تحسين المنتجات والخدمات وتجربة الاستخدام.',
            'الوفاء بالالتزامات القانونية والمحاسبية.',
          ],
          en: [
            'Fulfilling orders, bookings, delivery, and installation.',
            'Contacting you about your order, service, or offers you chose to follow.',
            'Improving our products, services, and user experience.',
            'Meeting legal and accounting obligations.',
          ],
        },
      },
      {
        h: { ar: 'مشاركة البيانات', en: 'Data sharing' },
        body: {
          ar: [
            'مش بنبيع بياناتك لأي طرف تالت.',
            'بنشارك البيانات الضرورية بس مع مزودي الخدمة زي شركات الشحن وبوابات الدفع والفروع المنفذة للخدمة.',
            'ممكن نفصح عن بيانات لو مطلوب قانونًا من الجهات المختصة.',
          ],
          en: [
            'We never sell your data to third parties.',
            'We only share necessary data with service providers such as shipping companies, payment gateways, and the branches performing the service.',
            'We may disclose data when legally required by competent authorities.',
          ],
        },
      },
      {
        h: { ar: 'أمان البيانات', en: 'Data security' },
        body: {
          ar: [
            'بنستخدم تشفير وإجراءات حماية مناسبة لتأمين بياناتك من الوصول غير المصرح به.',
            'بيانات الدفع بتتعالج عبر بوابات دفع مرخصة ومش بنخزن بيانات البطاقات على سيرفراتنا.',
          ],
          en: [
            'We use encryption and appropriate safeguards to protect your data from unauthorized access.',
            'Payment data is processed through licensed payment gateways; we do not store card details on our servers.',
          ],
        },
      },
      {
        h: { ar: 'ملفات الارتباط (Cookies)', en: 'Cookies' },
        body: {
          ar: [
            'بنستخدم ملفات تعريف الارتباط والتخزين المحلي لتسجيل دخولك وتفضيلاتك زي اللغة ومحتويات السلة.',
            'تقدر تعطل الكوكيز من إعدادات المتصفح، بس ممكن بعض المميزات متشتغلش صح.',
          ],
          en: [
            'We use cookies and local storage for sign-in and preferences such as language and cart contents.',
            'You can disable cookies in your browser settings, though some features may not work correctly.',
          ],
        },
      },
      {
        h: { ar: 'حقوقك', en: 'Your rights' },
        body: {
          ar: [
            'تقدر تطلب الاطلاع على بياناتك أو تصحيحها أو حذف حسابك من صفحة الملف الشخصي أو بالتواصل مع خدمة العملاء.',
            'في حالة حذف الحساب بنحتفظ فقط بالبيانات اللي بيفرضها القانون مثل الفواتير.',
          ],
          en: [
            'You can request access to, correction of, or deletion of your data from the profile page or by contacting customer service.',
            'When the account is deleted, we only retain data required by law, such as invoices.',
          ],
        },
      },
      {
        h: { ar: 'التواصل', en: 'Contact' },
        body: {
          ar: [
            'لأي استفسار عن الخصوصية كلمنا على الواتساب أو زور أقرب فرع — بيانات التواصل موجودة في أسفل الموقع.',
          ],
          en: [
            'For any privacy inquiries, contact us on WhatsApp or visit the nearest branch — contact details are at the bottom of the site.',
          ],
        },
      },
    ],
  },
};
