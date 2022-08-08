<!-- eslint-disable max-lines -->
<template>
  <div class="max-w-screen-xl mx-auto text-base prose">
    <template v-if="i18n.locale.value === 'de'">
      <h1>Datenschutzerklärung</h1>
      Beim Angebot dieser Website ist es es unumgänglich, dass wir Daten verarbeiten, die sich auf Sie oder eine andere
      natürliche Person beziehen lassen (personenbezogene Daten).<br>
      Nach Art. 4 DSGVO sind „personenbezogene Daten“ alle Informationen, die sich auf eine identifizierte oder
      identifizierbare natürliche Person (im Folgenden „betroffene Person“) beziehen; als identifizierbar wird eine
      natürliche Person angesehen, die direkt oder indirekt, insbesondere mittels Zuordnung zu einer Kennung wie einem
      Namen, zu einer Kennnummer, zu Standortdaten, zu einer Online-Kennung oder zu einem oder mehreren besonderen
      Merkmalen, die Ausdruck der physischen, physiologischen, genetischen, psychischen, wirtschaftlichen, kulturellen
      oder sozialen Identität dieser natürlichen Person sind, identifiziert werden kann.
      <h2>Name und Kontaktdaten des Verantwortlichen</h2>
      <p>
        Verantwortlicher im Sinne der Datenschutzgesetze, insbesondere der EU-Datenschutzgrundverordnung (Nach Art. 13
        Abs. 1 und Art. 14 Abs. 1 DSGVO), ist:
      </p>
      <canvas ref="responsibleCanvas" />
      <p>
        Da weniger als 20 Personen ständig mit der automatisierten Verarbeitung personenbezogener Daten beschäftigt
        sind, muss nach Art. 37 Abs. 4 DSGVO in Verbindung mit § 38 Abs. 1 BDSG kein Datenschutzbeauftragter bestellt
        werden.
      </p>
      <h2>Zwecke der Datenverarbeitung</h2>
      <p>
        Wir erheben, verarbeiten und nutzen personenbezogene Daten nur dann, wenn
        <ul>
          <li>
            Sie in die Verarbeitung eingewilligt haben (Art. 6 Abs. 1a DSGVO). In den Privatsphäreeinstellung dieser
            Website können Sie ihre Einwilligung mit Wirkung für die Zukunft widerrufen oder uns auch ihre Einwilligung zu
            einem späteren Zeitpunkt erteilen. Sie umfassen:
            <ul>
              <li>
                <b>Informationen der Anmeldung</b><br>
                Nach Ihrer erfolgreichen Anmeldung mit dem genutzten Drittanbieter übergibt er uns Ihre Nutzerdaten in
                einem kryptografisch signierten Datenpaket. In diesem Datenpaket befinden sich die persönliche Daten, die
                Sie zur Teilung bei dem Drittanbieter freigegeben haben (z.B. Mail-Adresse, Name).
              </li>
              <li>
                Name, Vorname
              </li>
              <li>
                <b>Technisch nicht notwendige Cookies</b><br>
                Diese Cookies erleichtern die Bedienung und ermöglichen damit ein angenehmere Nutzung unserer Website
                (z.B. Speichern der Spracheinstellungen) oder Unterstützen die Analyse des Userverhaltens.
              </li>
            </ul>
          </li>
          <!--li>die Verarbeitung zur Erfüllung eines Vertrages oder vorvertraglicher Maßnahmen erforderlich ist (Art. 6 Abs. 1b DSGVO)</li-->
          <li>
            die Verarbeitung zur Erfüllung einer uns obliegenden rechtlichen Verpflichtung erforderlich ist (Art. 6 Abs.
            1c DSGVO) oder
          </li>
          <li>
            sie zur Wahrung unserer berechtigten Interessen erforderlich sind (Art. 6 Abs. 1f DSGVO). Sie umfassen:
            <ul>
              <li>
                <b>Technisch notwendige Cookies</b><br>
                Ohne diese Cookies kann die technische Bereitstellung dieser Website nicht gewährleistet werden. Hierunter
                fallen z.B. Cookies, die die Daten der Anmeldung speichern. Sie werden beim Ausloggen oder Schließen des
                Browsers gelöscht.
              </li>
            </ul>
          </li>
        </ul>
      </p>
      <h2>Kategorien personenbezogener Daten</h2>
      <p>
        Wir verarbeiten folgenden Datenkategorien:
        <ul>
          <li>
            <b>Nutzerdaten</b><br>
            Bei einem Login auf dieser Website speichern und verwenden wir folgende Daten:
            <ul>
              <li>E-Mail-Adresse</li>
              <li>Name, Vorname</li>
              <li>Erteilung von Einverständnissen und Kenntnisnahme der Informationen zum Datenschutz</li>
              <li>Datum und Uhrzeit der Anfrage</li>
              <li>IP-Adresse</li>
            </ul>
          </li>
          <li>
            <b>Nutzungsdaten</b><br>
            Zusammengefasste Nutzungsdaten aus der Interaktion mit der Website, wie z.B. besuchte Unterseiten,
            Verweildauer, genutzter Browsertype und -version.
          </li>
          <li>
            <b>Log-Dateien</b><br>
            Wenn Sie auf unser Internet-Angebot zugreifen werden Daten über diesen Vorgang vorübergehend in einer
            Protokolldatei gespeichert und verarbeitet. Diese Log-Dateien werden zur Ermittlung von Störungen und aus
            Sicherheitsgründen für eine Dauer von 14 Tagen gespeichert und danach gelöscht. Die Log-Dateien können
            IP-Adresse, technische Browser- oder Anfragedetails, eindeutige technische Sessionkennung oder technische
            Kontokennung beinhalten.
          </li>
        </ul>
        Besondere Kategorien personenbezogener Daten nach Art. 9 Abs. 1 DSGVO werden nicht verarbeitet.
      </p>
      <h2>Empfänger oder Kategorien von Empfängern der personenbezogenen Daten</h2>
      <ul>
        <li>
          <b>Technische Dienstleister</b><br>
          Technische Dienstleister, die für den Betrieb oder die Wartung unserer Website als Auftragsverarbeiter tätig
          werden.
        </li>
        <li>
          <b>Google</b><br>
          Nach der Anmeldung mit einem google Konto (siehe auch <a
            href="https://support.google.com/accounts/answer/112802?hl=de"
          >Google Konto Hilfe</a>) vertrauen wir auf die
          Authentifizierung von Ihnen durch Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland
          (nachfolgend „Google“).
          Falls Sie sich erfolgreich anmelden verfügen Sie bereits über die relevanten Informationen über die Erhebung
          ihrer personenbezogenen Daten durch Google (siehe dazu auch <a
            href="https://policies.google.com/terms?hl=de"
          >Nutzungsbedingungen</a> und <a
            href="https://policies.google.com/privacy?hl=de"
          >Datenschutzerklärung</a>).
        </li>
      </ul>
      <h2>Übermittlung der Daten an Drittländer</h2>
      <p>
        Es kann nicht ausgeschlossen werden, dass Google Daten gegebenenfalls auch an Empfänger außerhalb des
        Europäischen Wirtschaftsraums übermittelt.
      </p>
      <h2>Dauer der Speicherung personenbezogenen Daten</h2>
      <p>
        Wir speichern Ihre Daten grundsätzlich solange, wie dies zur Erbringung des Angebots dieser Website
        erforderlich ist bzw. wir ein berechtigtes Interesse an der weiteren Speicherung haben.
      </p>
      <h2>Rechte des Betroffenen</h2>
      <p>
        Sie haben hinsichtlich der Sie betreffenden personenbezogenen Daten das Recht
        <ul>
          <li>auf Auskunft (Art. 15 DSGVO)</li>
          <li>auf Berichtigung (Art. 16 DSGVO)</li>
          <li>auf Löschung (Art. 17 DSGVO)</li>
          <li>auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>eines Widerspruchsrechts gegen die Verarbeitung (Art. 21 DSGVO)</li>
          <li>des Rechts auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
        </ul>
      </p>
      <h2>Widerruf der Einwilligung</h2>
      <p>
        Soweit Sie uns eine Einwilligung in die Verarbeitung Ihrer Daten erteilt haben, haben Sie das Recht, diese
        jederzeit ohne die Angabe von Gründen mit Wirkung für die Zukunft zu widerrufen. Die Rechtmäßigkeit der
        Verarbeitung Ihrer Daten bis zum Widerruf bleibt hiervon unberührt (Art. 7 Abs. 3 DSGVO). In den Einstellungen
        der Website kann der angemeldete Nutzer sein Konto jederzeit selber löschen. Sie können auch Cookies aus ihrem
        Browser jederezeit selber löschen. Genaue Schritte dafür finden Sie in einer Anleitung zu ihrem Browser.
      </p>
      <h2>Beschwerderecht bei der Aufsichtsbehörde</h2>
      <p>
        Sie haben das Recht auf Beschwerde bei einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres
        gewöhnlichen Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes (Art. 77 DSGVO).
        Zuständigen Aufsichtsbehörde ist der <a href="https://www.datenschutz-berlin.de">Berliner Beauftragte für
          Datenschutz und Informationsfreiheit</a>.
      </p>
      <h2>Erfrodernis der Bereitstellung der personenbezogenen Daten</h2>
      <p>
        Sofern nicht ausdrücklich angegeben, ist die Bereitstellung Ihrer Daten nicht erforderlich oder verpflichtend.
      </p>

      <h2>Weitere Hinweise</h2>
      <p>Es findet keine automatisierte Entscheidungsfindung oder Profiling statt.</p>
      <p>
        Wir treffen alle erforderlichen technischen und organisatorischen Maßnahmen um ein angemessenes Schutzniveau zu
        gewährleisten und die Daten, die wir verarbeiten insbesondere vor den Risiken der unbeabsichtigten oder
        unrechtmäßigen Vernichtung, Manipulation, Verlust, Veränderung oder unbefugter Offenlegung bzw. unbefugtem
        Zugriff zu schützen. Um die Sicherheit Ihrer Daten bei der Übertragung zu schützen, verwenden wir dem aktuellen
        Stand der Technik entsprechende Verschlüsselungsverfahren (z. B. SSL) über HTTPS.
      </p>
      <p>
        Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen
        Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei
        der Einführung neuer Funktionen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
      </p>
      <p>
        Trotz sorgfältiger Prüfung können wir keine Garantie oder Verantwortung für die Inhalte der externen verlinkten
        Seiten übernehmen, da diese sich nach der Linksetzung verändern können. Sollten Sie einen Link bemerken, der
        entweder nicht mehr funktioniert oder aber auf illegale oder thematisch unpassende Inhalte verweist,
        kontaktieren Sie uns bitte. Wir werden die Links dann unverzüglich löschen.
      </p>
    </template>

    <template v-else>
      <h1>Data Privacy Statement</h1>
      <h2>Identity and contact details of the Controller</h2>
      <p>
        Under Art. 13 (1) and Art. 14 (1) of the GDPR, responsibility for the processing of personal data lies with:
      </p>
      <canvas ref="responsibleCanvas" />
      <p>
        Since less than 20 people are constantly involved in the automated processing of personal data, no data
        protection officer has to be appointed according to Art. 37 Para. 4 or the GDPR in conjunction with Section 38
        Para. 1 German BDSG.
      </p>
      <h2>Purposes of processing</h2>
      <p>
        We only collect, process and use your personal data if
        <ul>
          <li>
            you have given consent (Art. 6 (1)(a) of the GDPR). In the privacy settings of this website, you may withdraw
            the consent with effect for the future or grant your consent at a later point in time. They includes:
            <ul>
              <li>
                <b>Informationen of Authentication</b><br>
                After successful authentication, the used identity provider sends us your userdata in a cryptogrpically
                signed data package. This data package contains the personal data that you have approved for sharing with
                us (e.g. mail address, name).
              </li>
              <li>
                <b>Cookies that are technically not required</b><br>
                These cookies that facilitate operation and thus allow you to browse our website more comfortably (e.g.
                save language settings) or support the analysis of user behavior.
              </li>
            </ul>
          </li>
          <!--li>if processing is necessary for the performance of a contract to which you are a party or in order to take steps at the request of you prior to entering into a contract (Art. 6 (1)(b) of the GDPR)</li-->
          <li>
            processing is necessary to comply with a legal obligation to which we are subject (Art. 6 (1) (c) of the
            GDPR)
          </li>
          <li>
            they necessary for the purposes of the legitimate interests pursued by us (Art. 6 (1) (f) of the GDPR). They
            include:
            <ul>
              <li>
                <b>Technically required cookies</b><br>
                Without these cookies, the technical provision of the online service cannot be ensured. These include
                cookies that save information about your login. They will removed when you log out or close the Browser.
              </li>
            </ul>
          </li>
        </ul>
      </p>
      <h2>Categories of personal data</h2>
      <p>
        We process the following categories of personal data:
        <ul>
          <li>
            <b>Userdata</b><br>
            On login to this website, we process the following data:
            <ul>
              <li>E-mail address</li>
              <li>First name, surname</li>
              <li>Consents granted and acknowledgement of data protection information</li>
              <li>Date and time of the request</li>
              <li>IP address</li>
            </ul>
          </li>
          <li>
            <b>Usage data</b><br>
            Aggregated usage data from interactions with this website, including visited subpages, retention time, used
            browsertype and -version.
          </li>
          <li>
            <b>Log files</b><br>
            When you access this website, data on your activity is temporarily stored and processed in a log file. These
            log files are stored and processed to identify defects and for security reasons for a period of 14 days and
            then deleted. Log files may contain IP address, techical browser or request details, unique technical session
            ID or technical user ID.
          </li>
        </ul>
        Special categories of personal data as in Art. 9 (1) of the GDPR are not processed.
      </p>
      <h2>Recipients or categories of recipients of the personal data</h2>
      <ul>
        <li>
          <b>Technical service providers</b><br>
          Technical service providers who act as processors for the operation or maintenance of our website.
        </li>
        <li>
          <b>Google</b><br>
          After login with a google account (also see <a
            href="https://support.google.com/accounts/answer/112802?hl=en"
          >Google Account Help</a>) we trust the
          authentication of you by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland (hereinafter
          „Google“).
          If you successfully login, you already have the relevant information of collection of personal data by Google
          (also see <a href="https://policies.google.com/terms?hl=en">Terms of Service</a> and <a
            href="https://policies.google.com/privacy?hl=en"
          >Privacy Policy</a>).
        </li>
      </ul>
      <h2>Transferal of personal data to a third country</h2>
      <p>
        It cannot be ruled out that Google may also transfer data to recipients outside the European Economic Area.
      </p>
      <h2>Storage period of personal data</h2>
      <p>
        We store your data for as long as necessary to provide the services on this website, or for as long as we have
        a legitimate interest in storing it further.
      </p>
      <h2>Rights of the data subjects</h2>
      <p>
        Right to request from the controller access to and rectification or erasure of personal data or restriction of
        processing concerning the data subject or to object to processing as well as the right to data portability.
      </p>
      <h2>Withdrawal of consent</h2>
      <p>
        If you have given us your consent to process your data, you have the right to revoke this at any time without
        giving reasons with effect for the future.
        The lawfulness of data processing prior to your withdrawal remains unchanged (Art. 7 (3) or the GDPR). As a
        logged in user, you can delete your account at any time yourself. You can also delete cookies from your browser
        yourself at any time. For detailed steps on how to do it consult a guide for your browser.
      </p>
      <h2>Right of appeal to a supervisory authority</h2>
      <p>
        You have the right to lodge a complaint with a supervisory authority, in particular in the Member State of your
        habitual residence, place of work or place of the alleged infringement (Art. 77 GDPR). Responsible supervisory
        authority in this case is <a href="https://www.datenschutz-berlin.de">Berliner Beauftragte für Datenschutz und
          Informationsfreiheit</a>.
      </p>
      <h2>Obligation to provide the personal data</h2>
      <p>Unless this is expressly stated, the provision of your data is not required or obligatory.</p>

      <h2>Further notes</h2>
      <p>There is no automated decision-making or profiling in place.</p>
      <p>
        We take necessary technical and organizational measures to provide an appropriate level of security and to
        protect the personal data we are processing from the risk of unintentional or unlawful destruction,
        manipulation,
        loss, change, or unauthorized disclosure or access. In order to protect the security of your data during
        transmission, we use state-of-the-art encryption methods (e.g. SSL) via HTTPS.
      </p>
      <p>
        We reserve the right to adapt this data privacy statement so that it always corresponds to the current legal
        requirements or to implement changes to our services in the data privacy statement, e.g. when introducing new
        features. The new data protection declaration will then apply to your next visit.
      </p>
      <p>
        Despite careful examination, we cannot assume any guarantee or responsibility for the content of the external
        linked pages, as these may change after the link was set. If you notice a link that either no longer works or
        refers to illegal or thematically inappropriate content, please contact us. We will then delete the links
        immediately.
      </p>
    </template>
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const i18n = useI18n(),
  responsibleCanvas = ref(),
  responsible = ref('');

axios.get('/api/csrf')
  .then(({ data: token }) =>
    axios.get('/api/responsible', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  )
  .then(({ data }) => (responsible.value = data))
  .catch(() => {});

function drawResponsible() {
  if (!responsibleCanvas.value) {
    return;
  }
  console.log('draw canvas with', responsible.value);
  const context = responsibleCanvas.value.getContext('2d'),
    { font, color } = getComputedStyle(responsibleCanvas.value.previousSibling);
  context.clearRect(0, 0, responsibleCanvas.value.width, responsibleCanvas.value.height);
  context.font = font;
  const { width, fontBoundingBoxAscent, fontBoundingBoxDescent } = context.measureText(responsible.value);
  responsibleCanvas.value.width = `${Math.ceil(width)}`;
  responsibleCanvas.value.height = fontBoundingBoxAscent + fontBoundingBoxDescent;
  context.font = font;
  context.fillStyle = color;
  context.fillText(responsible.value, 0, fontBoundingBoxAscent);
}

onMounted(drawResponsible);
watch(responsible, () => drawResponsible(), { immediate: true });

</script>
