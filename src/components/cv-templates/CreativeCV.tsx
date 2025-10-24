import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    marginBottom: 15,
    borderRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    border: '2 solid #ffffff',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  title: {
    fontSize: 12,
    color: '#e0e7ff',
    marginBottom: 8,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  contact: {
    fontSize: 9,
    color: '#ffffff',
    marginBottom: 2,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 15,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    border: '1 solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#667eea',
    textTransform: 'uppercase',
    borderBottom: '1 solid #667eea',
    paddingBottom: 3,
    fontFamily: 'Helvetica-Bold',
  },
  text: {
    marginBottom: 4,
    lineHeight: 1.4,
    fontFamily: 'Helvetica',
  },
  listItem: {
    marginLeft: 10,
    marginBottom: 2,
    fontFamily: 'Helvetica',
  },
  experienceItem: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderLeft: '3 solid #667eea',
  },
  experienceTitle: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 2,
    fontFamily: 'Helvetica-Bold',
  },
  experienceCompany: {
    fontSize: 9,
    color: '#667eea',
    marginBottom: 2,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  experienceDate: {
    fontSize: 8,
    marginBottom: 3,
    fontStyle: 'italic',
    fontFamily: 'Helvetica-Oblique',
  },
});

const defaultAvatar = 'https://ui-avatars.com/api/?name=CV&background=667eea&color=fff&size=120';

export const CreativeCV = ({ profile }: { profile: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image style={styles.photo} src={profile.photo || defaultAvatar} />
          <View style={styles.headerText}>
            <Text style={styles.name}>{profile.name || 'Ad Soyad'}</Text>
            <Text style={styles.title}>{profile.title || 'Meslek Unvanı'}</Text>
            <Text style={styles.contact}>{profile.email || 'email@example.com'}</Text>
            <Text style={styles.contact}>{profile.phone || '+90 555 123 45 67'}</Text>
            <Text style={styles.contact}>{profile.location || 'Şehir, Ülke'}</Text>
          </View>
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