import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import roboto from '../../assets/Roboto-Regular.ttf';

Font.register({ family: 'Roboto', src: roboto });

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fff',
    padding: 18,
    fontSize: 10,
    fontFamily: 'Roboto',
  },
  photo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    objectFit: 'cover',
    marginBottom: 8,
    border: '2 solid #e3e8ef',
    backgroundColor: '#e3e8ef',
    alignSelf: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  title: {
    fontSize: 11,
    marginBottom: 6,
    color: '#444',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#222',
    textTransform: 'uppercase',
    fontFamily: 'Roboto',
  },
  text: {
    marginBottom: 1,
    color: '#222',
    fontFamily: 'Roboto',
  },
  listItem: {
    marginLeft: 6,
    marginBottom: 1,
    fontFamily: 'Roboto',
  },
});

const defaultAvatar = 'https://ui-avatars.com/api/?name=CV&background=1746a2&color=fff&size=128';

export const MinimalCV = ({ profile }: { profile: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Image style={styles.photo} src={profile.photo || defaultAvatar} />
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.title}>{profile.title}</Text>
      <Text style={styles.text}>{profile.email} | {profile.phone} | {profile.location}</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkımda</Text>
        <Text style={styles.text}>{truncate(profile.about, 400)}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Beceriler</Text>
        <View>
          {profile.skills.slice(0, 8).map((s: string, i: number) => (
            <Text key={i} style={styles.listItem}>• {s}</Text>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İş Deneyimi</Text>
        {profile.experiences.slice(0, 3).map((exp: any, i: number) => (
          <View key={i} style={{ marginBottom: 3 }}>
            <Text style={{ fontWeight: 'bold', fontFamily: 'Roboto' }}>{truncate(exp.title, 40)} - {truncate(exp.company, 20)} ({exp.date})</Text>
            <Text style={styles.text}>{truncate(exp.desc, 120)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eğitim</Text>
        {profile.educations.slice(0, 2).map((edu: any, i: number) => (
          <View key={i} style={{ marginBottom: 3 }}>
            <Text style={{ fontWeight: 'bold', fontFamily: 'Roboto' }}>{truncate(edu.degree, 40)} - {truncate(edu.school, 20)} ({edu.date})</Text>
            <Text style={styles.text}>{truncate(edu.desc, 100)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diller</Text>
        {profile.languages.slice(0, 4).map((lang: any, i: number) => (
          <Text key={i} style={styles.listItem}>• {lang.name} ({lang.level})</Text>
        ))}
      </View>
    </Page>
  </Document>
); 