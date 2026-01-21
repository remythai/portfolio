import { JSX } from "react";
import Image from "next/image";

const services = [
    {
        title: "MUSCULATION",
        description:
            "Passionné de fitness et de développement personnel, je pratique la musculation régulièrement pour maintenir un équilibre physique et mental. La discipline et la persévérance acquises m'aident dans mes projets professionnels.",
        icon: (
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
            </svg>
        ),
    },
    {
        title: "JEUX VIDÉO COMPÉTITIF",
        description:
            "Joueur compétitif, j'apprécie les défis stratégiques et le travail d'équipe dans les jeux en ligne. Cette passion développe mon esprit d'analyse, ma réactivité et ma capacité à collaborer efficacement.",
        icon: (
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.97,16L5,19C4.67,19.3 4.23,19.5 3.75,19.5A1.75,1.75 0 0,1 2,17.75V17.5L3,10.12C3.21,7.81 5.14,6 7.5,6H16.5C18.86,6 20.79,7.81 21,10.12L22,17.5V17.75A1.75,1.75 0 0,1 20.25,19.5C19.77,19.5 19.33,19.3 19,19L16.03,16H7.97M7,8V10H5V11H7V13H8V11H10V10H8V8H7M16.5,8A0.75,0.75 0 0,0 15.75,8.75A0.75,0.75 0 0,0 16.5,9.5A0.75,0.75 0 0,0 17.25,8.75A0.75,0.75 0 0,0 16.5,8M14.75,9.75A0.75,0.75 0 0,0 14,10.5A0.75,0.75 0 0,0 14.75,11.25A0.75,0.75 0 0,0 15.5,10.5A0.75,0.75 0 0,0 14.75,9.75M18.25,9.75A0.75,0.75 0 0,0 17.5,10.5A0.75,0.75 0 0,0 18.25,11.25A0.75,0.75 0 0,0 19,10.5A0.75,0.75 0 0,0 18.25,9.75M16.5,11.5A0.75,0.75 0 0,0 15.75,12.25A0.75,0.75 0 0,0 16.5,13A0.75,0.75 0 0,0 17.25,12.25A0.75,0.75 0 0,0 16.5,11.5Z" />
            </svg>
        ),
    },
    {
        title: "CUISINE",
        description:
            "Amateur de cuisine créative, j'aime expérimenter de nouvelles recettes et techniques culinaires. Cette passion développe ma créativité, mon attention aux détails et ma capacité à suivre des processus méthodiques.",
        iconImage: "/wok.png",
    },
];

const usingNowSkills = [
    {
        name: "SCSS",
        iconImage: "/sass.png",
    },
    {
        name: "QWIK",
        iconImage: "/qwik-icon-seeklogo.png",
    },
    {
        name: "HTML",
        icon: (
            <svg className="w-full h-full" fill="#E34F26" viewBox="0 0 24 24">
                <path d="M12,17.56L16.07,16.43L16.62,10.33H9.38L9.2,8.3H16.8L17,6.31H7L7.56,12.32H14.45L14.22,14.9L12,15.5L9.78,14.9L9.64,13.24H7.64L7.93,16.43L12,17.56M4.07,3H19.93L18.5,19.2L12,21L5.5,19.2L4.07,3Z" />
            </svg>
        )
    },
    {
        name: "C",
        iconImage: "/c.png",
    },
    {
        name: "C++",
        iconImage: "/cpp.png",
    },
    {
        name: "NODE.JS",
        icon: (
            <svg className="w-full h-full" fill="#339933" viewBox="0 0 24 24">
                <path d="M12,1.85C11.73,1.85 11.45,1.92 11.22,2.05L3.78,6.35C3.3,6.63 3,7.15 3,7.71V16.29C3,16.85 3.3,17.37 3.78,17.65L5.73,18.77C6.68,19.23 7,19.24 7.44,19.24C8.84,19.24 9.65,18.39 9.65,16.91V8.44C9.65,8.32 9.55,8.22 9.43,8.22H8.5C8.37,8.22 8.27,8.32 8.27,8.44V16.91C8.27,17.57 7.59,18.22 6.5,17.67L4.45,16.5C4.38,16.46 4.34,16.37 4.34,16.29V7.71C4.34,7.62 4.38,7.54 4.45,7.5L11.89,3.21C11.95,3.17 12.05,3.17 12.11,3.21L19.55,7.5C19.62,7.54 19.66,7.62 19.66,7.71V16.29C19.66,16.37 19.62,16.46 19.55,16.5L12.11,20.78C12.05,20.82 11.95,20.82 11.88,20.78L10,19.65C9.92,19.62 9.84,19.61 9.79,19.64C9.26,19.94 9.16,20 8.67,20.15C8.55,20.19 8.36,20.26 8.74,20.47L11.22,21.94C11.46,22.08 11.72,22.15 12,22.15C12.28,22.15 12.54,22.08 12.78,21.94L20.22,17.65C20.7,17.37 21,16.85 21,16.29V7.71C21,7.15 20.7,6.63 20.22,6.35L12.78,2.05C12.55,1.92 12.28,1.85 12,1.85M14,8C11.88,8 10.61,8.89 10.61,10.39C10.61,12 11.87,12.47 13.91,12.67C16.34,12.91 16.53,13.27 16.53,13.75C16.53,14.58 15.86,14.93 14.3,14.93C12.32,14.93 11.9,14.44 11.75,13.46C11.73,13.36 11.64,13.28 11.53,13.28H10.57C10.45,13.28 10.36,13.37 10.36,13.5C10.36,14.74 11.04,16.24 14.3,16.24C16.65,16.24 18,15.31 18,13.69C18,12.08 16.92,11.66 14.63,11.35C12.32,11.05 12.09,10.89 12.09,10.35C12.09,9.9 12.29,9.3 14,9.3C15.5,9.3 16.09,9.63 16.32,10.66C16.34,10.76 16.43,10.83 16.53,10.83H17.5C17.55,10.83 17.61,10.81 17.65,10.76C17.69,10.72 17.72,10.66 17.7,10.6C17.56,8.82 16.38,8 14,8Z" />
            </svg>
        )
    },
    {
        name: "TYPESCRIPT",
        icon: (
            <svg className="w-full h-full" fill="#3178C6" viewBox="0 0 24 24">
                <path d="M3,3H21V21H3V3M13.71,17.86C14.21,18.84 15.22,19.59 16.8,19.59C18.4,19.59 19.6,18.76 19.6,17.23C19.6,15.82 18.79,15.19 17.35,14.57L16.93,14.39C16.2,14.08 15.89,13.87 15.89,13.37C15.89,12.96 16.2,12.64 16.7,12.64C17.18,12.64 17.5,12.85 17.79,13.37L19.1,12.5C18.55,11.54 17.77,11.17 16.7,11.17C15.19,11.17 14.22,12.13 14.22,13.4C14.22,14.78 15.03,15.43 16.25,15.95L16.67,16.13C17.45,16.47 17.91,16.68 17.91,17.26C17.91,17.74 17.46,18.09 16.76,18.09C15.93,18.09 15.45,17.66 15.09,17.06L13.71,17.86M13,11.25H8V12.75H9.5V20H11.25V12.75H13V11.25Z" />
            </svg>
        )
    },
    {
        name: "GITHUB",
        icon: (
            <svg className="w-full h-full" fill="#181717" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
            </svg>
        )
    },
];

const learningSkills = [
    {
        name: "REACT",
        icon: (
            <svg className="w-full h-full" fill="#61DAFB" viewBox="0 0 24 24">
                <path d="M12,10.11C13.03,10.11 13.87,10.95 13.87,12C13.87,13 13.03,13.85 12,13.85C10.97,13.85 10.13,13 10.13,12C10.13,10.95 10.97,10.11 12,10.11M7.37,20C8,20.38 9.38,19.8 10.97,18.3C10.45,17.71 9.94,17.07 9.46,16.4C8.64,16.32 7.83,16.2 7.06,16.04C6.55,18.18 6.74,19.65 7.37,20M8.08,14.26L7.79,13.75C7.68,14.04 7.57,14.33 7.5,14.61C7.77,14.67 8.07,14.72 8.38,14.77C8.28,14.6 8.18,14.43 8.08,14.26M14.62,13.5L15.43,12L14.62,10.5C14.32,9.97 14,9.5 13.71,9.03C13.17,9 12.6,9 12,9C11.4,9 10.83,9 10.29,9.03C10,9.5 9.68,9.97 9.38,10.5L8.57,12L9.38,13.5C9.68,14.03 10,14.5 10.29,14.97C10.83,15 11.4,15 12,15C12.6,15 13.17,15 13.71,14.97C14,14.5 14.32,14.03 14.62,13.5M12,6.78C11.81,7 11.61,7.23 11.41,7.5C11.61,7.5 11.8,7.5 12,7.5C12.2,7.5 12.39,7.5 12.59,7.5C12.39,7.23 12.19,7 12,6.78M12,17.22C12.19,17 12.39,16.77 12.59,16.5C12.39,16.5 12.2,16.5 12,16.5C11.8,16.5 11.61,16.5 11.41,16.5C11.61,16.77 11.81,17 12,17.22M16.62,4C16,3.62 14.62,4.2 13.03,5.7C13.55,6.29 14.06,6.93 14.54,7.6C15.36,7.68 16.17,7.8 16.94,7.96C17.45,5.82 17.26,4.35 16.62,4M15.92,9.74L16.21,10.25C16.32,9.96 16.43,9.67 16.5,9.39C16.23,9.33 15.93,9.28 15.62,9.23C15.72,9.4 15.82,9.57 15.92,9.74M17.37,2.69C18.84,3.53 19,5.74 18.38,8.32C20.92,9.07 22.75,10.31 22.75,12C22.75,13.69 20.92,14.93 18.38,15.68C19,18.26 18.84,20.47 17.37,21.31C15.91,22.15 13.92,21.19 12,19.36C10.08,21.19 8.09,22.15 6.62,21.31C5.16,20.47 5,18.26 5.62,15.68C3.08,14.93 1.25,13.69 1.25,12C1.25,10.31 3.08,9.07 5.62,8.32C5,5.74 5.16,3.53 6.62,2.69C8.09,1.85 10.08,2.81 12,4.64C13.92,2.81 15.91,1.85 17.37,2.69M17.08,12C17.42,12.75 17.72,13.5 17.97,14.26C20.07,13.63 21.25,12.73 21.25,12C21.25,11.27 20.07,10.37 17.97,9.74C17.72,10.5 17.42,11.25 17.08,12M6.92,12C6.58,11.25 6.28,10.5 6.03,9.74C3.93,10.37 2.75,11.27 2.75,12C2.75,12.73 3.93,13.63 6.03,14.26C6.28,13.5 6.58,12.75 6.92,12M15.92,14.26C15.82,14.43 15.72,14.6 15.62,14.77C15.93,14.72 16.23,14.67 16.5,14.61C16.43,14.33 16.32,14.04 16.21,13.75L15.92,14.26M13.03,18.3C14.62,19.8 16,20.38 16.62,20C17.26,19.65 17.45,18.18 16.94,16.04C16.17,16.2 15.36,16.32 14.54,16.4C14.06,17.07 13.55,17.71 13.03,18.3M8.08,9.74C8.18,9.57 8.28,9.4 8.38,9.23C8.07,9.28 7.77,9.33 7.5,9.39C7.57,9.67 7.68,9.96 7.79,10.25L8.08,9.74M10.97,5.7C9.38,4.2 8,3.62 7.37,4C6.74,4.35 6.55,5.82 7.06,7.96C7.83,7.8 8.64,7.68 9.46,7.6C9.94,6.93 10.45,6.29 10.97,5.7Z" />
            </svg>
        )
    },
    {
        name: "POSTGRESQL",
        iconImage: "/postgresql.png",
    },
    {
        name: "JAVASCRIPT",
        icon: (
            <svg className="w-full h-full" fill="#F7DF1E" viewBox="0 0 24 24">
                <path d="M3,3H21V21H3V3M7.73,18.04C8.13,18.89 8.92,19.59 10.27,19.59C11.77,19.59 12.8,18.79 12.8,17.04V11.26H11.1V17C11.1,17.86 10.75,18.08 10.2,18.08C9.62,18.08 9.38,17.68 9.11,17.21L7.73,18.04M13.71,17.86C14.21,18.84 15.22,19.59 16.8,19.59C18.4,19.59 19.6,18.76 19.6,17.23C19.6,15.82 18.79,15.19 17.35,14.57L16.93,14.39C16.2,14.08 15.89,13.87 15.89,13.37C15.89,12.96 16.2,12.64 16.7,12.64C17.18,12.64 17.5,12.85 17.79,13.37L19.1,12.5C18.55,11.54 17.77,11.17 16.7,11.17C15.19,11.17 14.22,12.13 14.22,13.4C14.22,14.78 15.03,15.43 16.25,15.95L16.67,16.13C17.45,16.47 17.91,16.68 17.91,17.26C17.91,17.74 17.46,18.09 16.76,18.09C15.93,18.09 15.45,17.66 15.09,17.06L13.71,17.86Z" />
            </svg>
        )
    },
];

const otherSkills = [
    {
        name: "ANGLAIS\n(NIVEAU C1)",
        iconImage: "/greatbritain.png",
    },
    {
        name: "ASSOCIATIF\n(BDE, ASSOS)",
        iconImage: "/association.png",
    },
    {
        name: "ÉCOLOGIE",
        icon: (
            <svg className="w-full h-full" fill="#22C55E" viewBox="0 0 24 24">
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
        )
    },
];

export const SkillsAndExperienceSection = (): JSX.Element => {
    return (
        <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative inline-block mx-auto mb-12 md:mb-16 w-full flex justify-center">
                    <div className="relative border-4 md:border-8 border-solid border-black px-8 md:px-12 py-4 md:py-6">
                        <h2 className="font-montserrat font-bold text-black text-2xl sm:text-3xl md:text-4xl text-center tracking-[8px] md:tracking-[10.66px]">
                            A PROPOS
                        </h2>
                    </div>
                </div>

                <p className="max-w-3xl mx-auto text-center font-open-sans font-normal text-black text-sm md:text-base mb-8 md:mb-12 px-4">
                    Etudiant en 3ème année à Epitech sur le campus de Bordeaux. Curieux, créatif et déterminé, j'aime découvrir de nouveaux horizons ou bien renforcer mes compétences professionnelles mais aussi personnelles.
                </p>

                <div className="w-32 md:w-40 h-1 bg-black mx-auto mb-12 md:mb-20" aria-hidden="true" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-16 md:mb-24">
                    {services.map((service, index) => (
                        <article
                            key={index}
                            className="flex flex-col items-center text-center p-6 hover:scale-105 transition-transform duration-300"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6 flex items-center justify-center text-black relative">
                                {service.iconImage ? (
                                    <Image
                                        src={service.iconImage}
                                        alt={service.title}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    service.icon
                                )}
                            </div>
                            <h3 className="font-montserrat font-bold text-black text-lg md:text-xl lg:text-2xl tracking-wider mb-4">
                                {service.title}
                            </h3>
                            <p className="font-open-sans font-light text-black text-sm md:text-base text-justify max-w-md">
                                {service.description}
                            </p>
                        </article>
                    ))}
                </div>

                <div className="w-32 md:w-40 h-1 bg-black mx-auto mb-16 md:mb-24" aria-hidden="true" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative inline-block mx-auto mb-12 md:mb-16 w-full flex justify-center">
                    <div className="relative border-4 md:border-8 border-solid border-black px-8 md:px-12 py-4 md:py-6">
                        <h2 className="font-montserrat font-bold text-black text-2xl sm:text-3xl md:text-4xl text-center tracking-[8px] md:tracking-[10.66px]">
                            COMPÉTENCES
                        </h2>
                    </div>
                </div>

                <div className="mb-16 md:mb-24">
                    <h3 className="font-montserrat font-bold text-black text-xl md:text-2xl lg:text-3xl tracking-wider text-center mb-8 md:mb-12">
                        EN CE MOMENT :
                    </h3>
                    <div className={`grid ${usingNowSkills.length <= 4 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-' + Math.min(usingNowSkills.length, 4) : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'} gap-8 md:gap-12 place-content-center`}>
                        {usingNowSkills.map((skill, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center group hover:scale-110 transition-transform duration-300"
                            >
                                <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mb-4 p-2">
                                    {skill.iconImage ? (
                                        <Image
                                            src={skill.iconImage}
                                            alt={skill.name}
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        skill.icon
                                    )}
                                </div>
                                <p className="font-montserrat font-normal text-black text-sm md:text-base lg:text-lg text-center tracking-wider">
                                    {skill.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-16 md:mb-24">
                    <h3 className="font-montserrat font-bold text-black text-xl md:text-2xl lg:text-3xl tracking-wider text-center mb-8 md:mb-12">
                        EN APPRENTISSAGE :
                    </h3>
                    <div className={`grid ${learningSkills.length <= 4 ? 'grid-cols-2 sm:grid-cols-' + Math.min(learningSkills.length, 3) + ' md:grid-cols-' + learningSkills.length : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'} gap-8 md:gap-12 place-content-center`}>
                        {learningSkills.map((skill, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center group hover:scale-110 transition-transform duration-300"
                            >
                                <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mb-4 p-2">
                                    {skill.iconImage ? (
                                        <Image
                                            src={skill.iconImage}
                                            alt={skill.name}
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        skill.icon
                                    )}
                                </div>
                                <p className="font-montserrat font-normal text-black text-sm md:text-base lg:text-lg text-center tracking-wider">
                                    {skill.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-montserrat font-bold text-black text-xl md:text-2xl lg:text-3xl tracking-wider text-center mb-8 md:mb-12">
                        AUTRES COMPÉTENCES :
                    </h3>
                    <div className={`grid ${otherSkills.length <= 4 ? 'grid-cols-2 sm:grid-cols-' + Math.min(otherSkills.length, 3) + ' md:grid-cols-' + otherSkills.length : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'} gap-8 md:gap-12 place-content-center`}>
                        {otherSkills.map((skill, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center group hover:scale-110 transition-transform duration-300"
                            >
                                <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mb-4 p-2">
                                    {skill.iconImage ? (
                                        <Image
                                            src={skill.iconImage}
                                            alt={skill.name}
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        skill.icon
                                    )}
                                </div>
                                <p className="font-montserrat font-normal text-black text-sm md:text-base lg:text-lg text-center tracking-wider whitespace-pre-line">
                                    {skill.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
