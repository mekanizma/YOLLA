import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2 solid #3b82f6',
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1f2937',
    fontFamily: 'Helvetica-Bold',
  },
  title: {
    fontSize: 12,
    color: '#3b82f6',
    marginBottom: 8,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  contact: {
    fontSize: 9,
    marginBottom: 2,
    color: '#374151',
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 3,
    color: '#1f2937',
    fontFamily: 'Helvetica-Bold',
  },
  text: {
    marginBottom: 4,
    lineHeight: 1.4,
    color: '#374151',
    fontFamily: 'Helvetica',
  },
  listItem: {
    marginLeft: 10,
    marginBottom: 2,
    color: '#374151',
    fontFamily: 'Helvetica',
  },
  experienceItem: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeft: '2 solid #e5e7eb',
  },
  experienceTitle: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 2,
    color: '#374151',
    fontFamily: 'Helvetica-Bold',
  },
  experienceCompany: {
    fontSize: 9,
    color: '#3b82f6',
    marginBottom: 2,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  experienceDate: {
    fontSize: 8,
    marginBottom: 3,
    fontStyle: 'italic',
    color: '#6b7280',
    fontFamily: 'Helvetica-Oblique',
  },
});

const defaultAvatar = 'https://ui-avatars.com/api/?name=CV&background=3b82f6&color=fff&size=120';

export const ElegantCV = ({ profile }: { profile: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image style={styles.photo} src={profile.photo || defaultAvatar} />
        <View style={styles.headerContent}>
          <Text style={styles.name}>{profile.name || 'Ad Soyad'}</Text>
          <Text style={styles.title}>{profile.title || 'Meslek Unvanı'}</Text>
          <Text style={styles.contact}>{profile.email || 'email@example.com'}</Text>
          <Text style={styles.contact}>{profile.phone || '+90 555 123 45 67'}</Text>
          <Text style={styles.contact}>{profile.location || 'Şehir, Ülke'}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkımda</Text>
        <Text style={styles.text}>{profile.about || 'Kendiniz hakkında kısa bir açıklama yazın.'}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Beceriler</Text>
        {(profile.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git']).slice(0, 6).map((s: string, i: number) => (
          <Text key={i} style={styles.listItem}>• {s}</Text>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İş Deneyimi</Text>
        {(profile.experiences || [
          { title: 'Yazılım Geliştirici', company: 'ABC Teknoloji', date: '2022-2024', desc: 'Web uygulamaları geliştirme' },
          { title: 'Stajyer', company: 'XYZ Şirketi', date: '2021-2022', desc: 'Frontend geliştirme' }
        ]).slice(0, 2).map((exp: any, i: number) => (
          <View key={i} style={styles.experienceItem}>
            <Text style={styles.experienceTitle}>{exp.title}</Text>
            <Text style={styles.experienceCompany}>{exp.company}</Text>
            <Text style={styles.experienceDate}>{exp.date}</Text>
            <Text style={styles.text}>{exp.desc}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eğitim</Text>
        {(profile.educations || [
          { degree: 'Bilgisayar Mühendisliği', school: 'Üniversite Adı', date: '2018-2022', desc: 'Lisans derecesi' }
        ]).slice(0, 1).map((edu: any, i: number) => (
          <View key={i} style={styles.experienceItem}>
            <Text style={styles.experienceTitle}>{edu.degree}</Text>
            <Text style={styles.experienceCompany}>{edu.school}</Text>
            <Text style={styles.experienceDate}>{edu.date}</Text>
            <Text style={styles.text}>{edu.desc}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diller</Text>
        {(profile.languages || [
          { name: 'Türkçe', level: 'Ana Dil' },
          { name: 'İngilizce', level: 'İleri' }
        ]).slice(0, 2).map((lang: any, i: number) => (
          <Text key={i} style={styles.listItem}>• {lang.name} ({lang.level})</Text>
        ))}
      </View>
    </Page>
  </Document>
);