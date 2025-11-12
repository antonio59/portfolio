import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { getAboutSections, type AboutSection } from "../lib/pocketbase";

export default function About() {
  const { data: aboutSections = [] } = useQuery<AboutSection[]>({
    queryKey: ["about-sections"],
    queryFn: getAboutSections,
    staleTime: 5 * 60 * 1000,
  });

  // Get specific sections
  const backgroundSection = aboutSections.find(s => s.section_type === 'background');
  const drivesSection = aboutSections.find(s => s.section_type === 'what_drives_me');
  const interestsSection = aboutSections.find(s => s.section_type === 'interests');
  // Professional Skills
  const professionalSkills = [
    "Project Management",
    "Programme Management",
    "Agile",
    "Scrum",
    "PRINCE2",
    "PMP",
    "Risk Management",
    "Stakeholder Management",
    "Budget Planning",
    "Resource Allocation",
    "Strategic Planning",
    "Change Management",
  ];

  // Technical Skills
  const technicalSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "React Native",
    "Node.js",
    "Python",
    "Flutter",
    "MongoDB",
    "SQL",
    "Firebase",
    "Git",
    "CI/CD",
  ];

  // Music playlist data
  const artists = [
    {
      name: "James Blake",
      imageUrl:
        "https://static.wikia.nocookie.net/jamming_universe/images/3/33/JamesBlake.jpg/revision/latest?cb=20171102235746",
    },
    {
      name: "Beyonce",
      imageUrl:
        "https://cdn.britannica.com/51/188751-050-D4E1CFBC/Beyonce-2010.jpg",
    },
    {
      name: "Black Eyed Peas",
      imageUrl:
        "https://i.pinimg.com/736x/44/2a/0c/442a0c54ce00e6b7965d06027735c7c2.jpg",
    },
    {
      name: "Robyn",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/b/bc/Robyn_-_Jingle_Bell_Ball_2018.png",
    },
    {
      name: "Calvin Harris",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Calvin_Harris_-_Rock_in_Rio_Madrid_2012_-_09.jpg/640px-Calvin_Harris_-_Rock_in_Rio_Madrid_2012_-_09.jpg",
    },
  ];

  // Books data
  const books = [
    {
      title: "Butter",
      author: "Asako Yuzuki",
      coverUrl:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1686160520i/172499454.jpg",
    },
    {
      title: "Think and Grow Rich",
      author: "Napoleon Hill",
      coverUrl:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1463241782i/30186948.jpg",
    },
    {
      title: "Steve Jobs",
      author: "Walter Isaacson",
      coverUrl:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1511288482i/11084145.jpg",
    },
    {
      title: "The Design of Everyday Things",
      author: "Don Norman",
      coverUrl:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1442460745i/840.jpg",
    },
    {
      title: "Atomic Habits",
      author: "James Clear",
      coverUrl:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section id="about" className="py-20 bg-primaryBg">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Text Content - Left Side */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-textColor">
                {backgroundSection?.title || "About Me"}
              </h2>
              {backgroundSection?.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-gray-600 mb-6">
                  {paragraph}
                </p>
              ))}
              {!backgroundSection && (
                <>
                  <p className="text-gray-600 mb-6">
                    I'm an experienced Project and Programme Manager with over 10
                    years of professional experience in the technology sector.
                  </p>
                  <p className="text-gray-600 mb-6">
                    While my primary profession is project management, I'm also
                    passionate about software development.
                  </p>
                </>
              )}
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold mb-4 text-textColor">
                Professional Skills
              </h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {professionalSkills.map((skill, index) => (
                  <motion.span
                    key={index}
                    variants={itemVariants}
                    className="px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200 text-gray-700 text-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-4 text-textColor mt-8">
                Technical Skills (Hobby Development)
              </h3>
              <div className="flex flex-wrap gap-3">
                {technicalSkills.map((skill, index) => (
                  <motion.span
                    key={index}
                    variants={itemVariants}
                    className="px-4 py-2 rounded-full bg-white shadow-sm border border-accentColor/20 text-gray-700 text-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Personal Interests - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Music Playlist */}
            <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Listening to...
                </h3>
                <a
                  href="https://open.spotify.com/user/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1982px-Spotify_icon.svg.png"
                    alt="Spotify"
                    className="h-4 w-4 mr-1"
                  />
                  My Spotify
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>

              <div className="relative">
                <div className="flex overflow-x-auto pb-4 space-x-2 scrollbar-hide">
                  {artists.map((artist, index) => (
                    <div
                      key={index}
                      className="flex-none w-16 transition-transform hover:scale-105"
                    >
                      <div className="w-16 h-16 rounded-md overflow-hidden shadow-sm">
                        <img
                          src={artist.imageUrl}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-center mt-1 text-gray-700 truncate">
                        {artist.name}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="absolute left-0 top-0 h-16 w-6 bg-gradient-to-r from-white to-transparent"></div>
                <div className="absolute right-0 top-0 h-16 w-6 bg-gradient-to-l from-white to-transparent"></div>
              </div>
            </div>

            {/* Bookshelf */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                My bookshelf
              </h3>

              <div className="relative py-4">
                <div className="flex items-end justify-center py-3 overflow-x-auto scrollbar-hide">
                  {books.map((book, index) => (
                    <div
                      key={index}
                      className="mx-2 relative transition-transform hover:scale-105 hover:-translate-y-1"
                    >
                      <div className="h-36 w-24 shadow-md rounded-sm overflow-hidden">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 w-full h-2 bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
