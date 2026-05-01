export interface City {
  name: string;
}

export interface District {
  name: string;
  cities: string[];
}

export interface Province {
  name: string;
  districts: District[];
}

export const PAKISTAN_LOCATIONS: Province[] = [
  {
    name: "Punjab",
    districts: [
      { name: "Lahore", cities: ["Lahore City", "Raiwind", "Cantonment"] },
      { name: "Faisalabad", cities: ["Faisalabad City", "Jaranwala", "Chak Jhumra", "Samundri", "Tandlianwala"] },
      { name: "Rawalpindi", cities: ["Rawalpindi City", "Gujar Khan", "Taxila", "Murree", "Kahuta", "Kotli Sattian"] },
      { name: "Multan", cities: ["Multan City", "Shujabad", "Jalalpur Pirwala"] },
      { name: "Gujranwala", cities: ["Gujranwala City", "Kamoke", "Nowshera Virkan", "Wazirabad"] },
      { name: "Sargodha", cities: ["Sargodha City", "Bhalwal", "Shahpur", "Sillanwali", "Kot Momin"] },
      { name: "Bahawalpur", cities: ["Bahawalpur City", "Ahmedpur East", "Hasilpur", "Yazman", "Khairpur Tamewali"] },
      { name: "Sialkot", cities: ["Sialkot City", "Daska", "Pasrur", "Sambrial"] },
      { name: "Sheikhupura", cities: ["Sheikhupura City", "Muridke", "Ferozewala", "Sharakpur", "Safdarabad"] },
      { name: "Rahim Yar Khan", cities: ["Rahim Yar Khan City", "Sadiqabad", "Khanpur", "Liaquatpur"] },
      { name: "Sahiwal", cities: ["Sahiwal City", "Chichawatni"] },
      { name: "Okara", cities: ["Okara City", "Depalpur", "Renala Khurd"] },
      { name: "Kasur", cities: ["Kasur City", "Chunian", "Pattoki", "Kot Radha Kishan"] },
      { name: "Chiniot", cities: ["Chiniot City", "Lalian", "Bhowana"] },
      { name: "Jhang", cities: ["Jhang City", "Shorkot", "Ahmadpur Sial", "18-Hazari"] },
      { name: "Attock", cities: ["Attock City", "Hassan Abdal", "Fateh Jang", "Pindi Gheb", "Hazro", "Jand"] },
      { name: "Bahawalnagar", cities: ["Bahawalnagar City", "Chishtian", "Fort Abbas", "Haroonabad", "Minchinabad"] },
      { name: "Bhakkar", cities: ["Bhakkar City", "Darya Khan", "Kaloorkot", "Mankera"] },
      { name: "Chakwal", cities: ["Chakwal City", "Choa Saidan Shah", "Kallar Kahar", "Talagang"] },
      { name: "Dera Ghazi Khan", cities: ["D.G. Khan City", "Taunsa Sharif", "Kot Chutta"] },
      { name: "Gujrat", cities: ["Gujrat City", "Kharian", "Sarai Alamgir"] },
      { name: "Hafizabad", cities: ["Hafizabad City", "Pindi Bhattian"] },
      { name: "Jhelum", cities: ["Jhelum City", "Dina", "Sohawa", "Pind Dadan Khan"] },
      { name: "Khanewal", cities: ["Khanewal City", "Kabirwala", "Mian Channu", "Jahanian"] },
      { name: "Khushab", cities: ["Khushab City", "Noorpur Thal", "Quaidabad", "Naushera"] },
      { name: "Layyah", cities: ["Layyah City", "Chaubara", "Karor Lal Esan"] },
      { name: "Lodhran", cities: ["Lodhran City", "Dunyapur", "Karor Pacca"] },
      { name: "Mandi Bahauddin", cities: ["Mandi Bahauddin City", "Phalia", "Malakwal"] },
      { name: "Mianwali", cities: ["Mianwali City", "Piplan", "Isakhel"] },
      { name: "Muzaffargarh", cities: ["Muzaffargarh City", "Alipur", "Jatoi", "Kot Addu"] },
      { name: "Narowal", cities: ["Narowal City", "Shakargarh", "Zafarwal"] },
      { name: "Nankana Sahib", cities: ["Nankana Sahib City", "Sangla Hill", "Shah Kot"] },
      { name: "Pakpattan", cities: ["Pakpattan City", "Arifwala"] },
      { name: "Rajanpur", cities: ["Rajanpur City", "Jampur", "Rojhan"] },
      { name: "Toba Tek Singh", cities: ["Toba Tek Singh City", "Gojra", "Kamalia", "Pir Mahal"] },
      { name: "Vehari", cities: ["Vehari City", "Burewala", "Mailsi"] }
    ]
  },
  {
    name: "Sindh",
    districts: [
      { name: "Karachi Central", cities: ["Gulberg", "Liaquatabad", "North Nazimabad", "New Karachi"] },
      { name: "Karachi East", cities: ["Gulshan-e-Iqbal", "Jamshed Quarters", "Ferozabad", "Gulzar-e-Hijri"] },
      { name: "Karachi South", cities: ["Lyari", "Saddar", "Aram Bagh", "Civil Lines"] },
      { name: "Karachi West", cities: ["Orangi Town", "SITE Town", "Mominabad"] },
      { name: "Keamari", cities: ["Keamari Town", "Baldia Town"] },
      { name: "Korangi", cities: ["Korangi Town", "Landhi Town", "Shah Faisal Town"] },
      { name: "Malir", cities: ["Bin Qasim Town", "Gadap Town", "Ibrahim Hyderi"] },
      { name: "Hyderabad", cities: ["Hyderabad City", "Latifabad", "Qasimabad", "Tando Jam"] },
      { name: "Sukkur", cities: ["Sukkur City", "Rohri", "Pano Akil", "Saleh Pat"] },
      { name: "Larkana", cities: ["Larkana City", "Ratodero", "Dokri", "Bakrani"] },
      { name: "Shaheed Benazirabad", cities: ["Nawabshah City", "Sakrand", "Daur", "Qazi Ahmed"] },
      { name: "Mirpur Khas", cities: ["Mirpur Khas City", "Digri", "Kotli Ghulam Mohammad", "Jhuddo"] },
      { name: "Thatta", cities: ["Thatta City", "Mirpur Sakro", "Keti Bandar"] },
      { name: "Badin", cities: ["Badin City", "Matli", "Tando Bago", "Golarchi"] },
      { name: "Dadu", cities: ["Dadu City", "Mehar", "Khairpur Nathan Shah", "Johi"] },
      { name: "Ghotki", cities: ["Ghotki City", "Daharki", "Ubauro", "Mirpur Mathelo"] },
      { name: "Jacobabad", cities: ["Jacobabad City", "Garhi Khairo", "Thul"] },
      { name: "Jamshoro", cities: ["Jamshoro City", "Kotri", "Sehwan Sharif"] },
      { name: "Kambhar Shahdadkot", cities: ["Kamber City", "Shahdadkot", "Warah"] },
      { name: "Kashmore", cities: ["Kashmore City", "Kandhkot", "Tangwani"] },
      { name: "Khairpur", cities: ["Khairpur City", "Kot Diji", "Gambat", "Kingri"] },
      { name: "Matiari", cities: ["Matiari City", "Hala", "Saeedabad"] },
      { name: "Sanghar", cities: ["Sanghar City", "Tando Adam", "Shahdadpur", "Khipro"] },
      { name: "Shikarpur", cities: ["Shikarpur City", "Lakhi Ghulam Shah", "Khanpur"] },
      { name: "Sujawal", cities: ["Sujawal City", "Jati", "Chuhar Jamali"] },
      { name: "Tando Allahyar", cities: ["Tando Allahyar City", "Chamber"] },
      { name: "Tando Muhammad Khan", cities: ["Tando Muhammad Khan City", "Bulri Shah Karim"] },
      { name: "Tharparkar", cities: ["Mithi", "Islamkot", "Chachro", "Nagarparkar"] },
      { name: "Umerkot", cities: ["Umerkot City", "Pithoro", "Kunri"] },
      { name: "Naushahro Feroze", cities: ["Naushahro Feroze City", "Moro", "Bhiria"] }
    ]
  },
  {
    name: "Khyber Pakhtunkhwa",
    districts: [
      { name: "Peshawar", cities: ["Peshawar City", "Hayatabad"] },
      { name: "Mardan", cities: ["Mardan City", "Takht Bhai", "Katlang"] },
      { name: "Abbottabad", cities: ["Abbottabad City", "Havelian"] },
      { name: "Swat", cities: ["Mingora", "Barikot", "Kabal", "Matta", "Khwazakhela"] },
      { name: "Mansehra", cities: ["Mansehra City", "Balakot", "Oghi"] },
      { name: "Kohat", cities: ["Kohat City", "Lachi"] },
      { name: "Dera Ismail Khan", cities: ["D.I. Khan City", "Paharpur", "Kulachi"] },
      { name: "Nowshera", cities: ["Nowshera City", "Pabbi", "Akora Khattak"] },
      { name: "Charsadda", cities: ["Charsadda City", "Tangi", "Shabqadar"] },
      { name: "Swabi", cities: ["Swabi City", "Topi", "Lahor"] },
      { name: "Haripur", cities: ["Haripur City", "Ghazi"] },
      { name: "Bannu", cities: ["Bannu City", "Domel"] },
      { name: "Malakand", cities: ["Batkhela", "Dargai"] },
      { name: "Buner", cities: ["Daggar", "Gagra"] },
      { name: "Upper Dir", cities: ["Dir City", "Wari"] },
      { name: "Lower Dir", cities: ["Timergara", "Chakdara"] },
      { name: "Shangla", cities: ["Alpurai", "Besham"] },
      { name: "Lower Chitral", cities: ["Chitral City", "Drosh"] },
      { name: "Upper Chitral", cities: ["Mastuj", "Buni"] },
      { name: "Upper Kohistan", cities: ["Dassu"] },
      { name: "Lower Kohistan", cities: ["Pattan"] },
      { name: "Kolai Palas", cities: ["Palas"] },
      { name: "Hangu", cities: ["Hangu City", "Tall"] },
      { name: "Karak", cities: ["Karak City", "Banda Daud Shah"] },
      { name: "Lakki Marwat", cities: ["Lakki Marwat City", "Naurang"] },
      { name: "Tank", cities: ["Tank City"] },
      { name: "Bajaur", cities: ["Khar", "Nawagai"] },
      { name: "Khyber", cities: ["Landi Kotal", "Jamrud", "Bari"] },
      { name: "Mohmand", cities: ["Ghalanai", "Ekka Ghund"] },
      { name: "Kurram", cities: ["Parachinar", "Sadda"] },
      { name: "Orakzai", cities: ["Kalaya", "Hangu"] },
      { name: "North Waziristan", cities: ["Miran Shah", "Razmak"] },
      { name: "Lower South Waziristan", cities: ["Wana"] },
      { name: "Upper South Waziristan", cities: ["Spinkai"] },
      { name: "Torghar", cities: ["Judba"] }
    ]
  },
  {
    name: "Balochistan",
    districts: [
      { name: "Quetta", cities: ["Quetta City", "Panjpai", "Kuchlak"] },
      { name: "Gwadar", cities: ["Gwadar City", "Pasni", "Ormara", "Jiwani"] },
      { name: "Pishin", cities: ["Pishin City", "Hurramzai", "Saranan"] },
      { name: "Khuzdar", cities: ["Khuzdar City", "Wadh", "Nal"] },
      { name: "Sibi", cities: ["Sibi City", "Lehri"] },
      { name: "Loralai", cities: ["Loralai City", "Bori"] },
      { name: "Kech", cities: ["Turbat City", "Buleda", "Tump"] },
      { name: "Lasbela", cities: ["Uthal", "Bela", "Lakhra"] },
      { name: "Hub", cities: ["Hub City", "Dureji", "Gaddani"] },
      { name: "Ziarat", cities: ["Ziarat", "Sinjawi"] },
      { name: "Awaran", cities: ["Awaran City", "Mashkay"] },
      { name: "Barkhan", cities: ["Barkhan City"] },
      { name: "Chagai", cities: ["Dalbandin", "Nok Kundi"] },
      { name: "Dera Bugti", cities: ["Dera Bugti City", "Sui"] },
      { name: "Dukki", cities: ["Dukki City"] },
      { name: "Harnai", cities: ["Harnai City", "Shahrig"] },
      { name: "Jafarabad", cities: ["Dera Allah Yar", "Jhat Pat"] },
      { name: "Jhal Magsi", cities: ["Gandawah", "Jhal Magsi City"] },
      { name: "Kalat", cities: ["Kalat City", "Mangochar"] },
      { name: "Kharan", cities: ["Kharan City"] },
      { name: "Killa Abdullah", cities: ["Gulistan"] },
      { name: "Chaman", cities: ["Chaman City"] },
      { name: "Killa Saifullah", cities: ["Killa Saifullah City", "Muslim Bagh"] },
      { name: "Kohlu", cities: ["Kohlu City", "Maiwand"] },
      { name: "Mastung", cities: ["Mastung City", "Khad Kocha"] },
      { name: "Musakhel", cities: ["Musakhel City", "Kingri"] },
      { name: "Nasirabad", cities: ["Dera Murad Jamali", "Tamboo"] },
      { name: "Nushki", cities: ["Nushki City"] },
      { name: "Panjgur", cities: ["Panjgur City", "Gowargo"] },
      { name: "Sherani", cities: ["Sherani City"] },
      { name: "Sohbatpur", cities: ["Sohbatpur City"] },
      { name: "Washuk", cities: ["Washuk City", "Besima"] },
      { name: "Zhob", cities: ["Zhob City", "Sambaza"] },
      { name: "Surab", cities: ["Surab City"] },
      { name: "Usta Mohammad", cities: ["Usta Mohammad City"] }
    ]
  },
  {
    name: "Gilgit Baltistan",
    districts: [
      { name: "Gilgit", cities: ["Gilgit City", "Danyor", "Juglot"] },
      { name: "Skardu", cities: ["Skardu City", "Rondu", "Gamba"] },
      { name: "Hunza", cities: ["Aliabad", "Gojal", "Karimabad"] },
      { name: "Diamer", cities: ["Chilas", "Darel", "Tangir"] },
      { name: "Ghizer", cities: ["Gahkuch", "Ishkoman", "Punial"] },
      { name: "Astore", cities: ["Eidgah", "Shounter"] },
      { name: "Ghanche", cities: ["Khaplu", "Mashabrum"] },
      { name: "Kharmang", cities: ["Tolti"] },
      { name: "Shigar", cities: ["Shigar City"] },
      { name: "Nagar", cities: ["Nagarkhas"] },
      { name: "Gupis-Yasin", cities: ["Phander"] }
    ]
  },
  {
    name: "Islamabad",
    districts: [
      { name: "Islamabad Capital", cities: ["Islamabad City", "Bara Kahu", "Tarnol", "Sihala", "Nilore"] }
    ]
  },
  {
    name: "Azad Kashmir",
    districts: [
      { name: "Muzaffarabad", cities: ["Muzaffarabad City", "Hattian Bala"] },
      { name: "Mirpur", cities: ["Mirpur City", "Dadyal"] },
      { name: "Kotli", cities: ["Kotli City", "Sehnsa", "Charhoi"] },
      { name: "Poonch", cities: ["Rawalakot City", "Hajira", "Abbaspur"] },
      { name: "Bagh", cities: ["Bagh City", "Dhirkot", "Hari Ghel"] },
      { name: "Bhimber", cities: ["Bhimber City", "Barnala", "Samahni"] },
      { name: "Haveli", cities: ["Forward Kahuta"] },
      { name: "Jhelum Valley", cities: ["Hattian Bala"] },
      { name: "Neelum", cities: ["Athmuqam", "Sharda"] },
      { name: "Sudhanoti", cities: ["Pallandri", "Trarkhel"] }
    ]
  }
];
