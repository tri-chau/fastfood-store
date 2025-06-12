import React from "react";
import {Link} from "react-router-dom";
import {FaFacebook, FaInstagram} from "react-icons/fa";
import {useTranslation} from "react-i18next";

const Footer = () => {
    const {t} = useTranslation();

    return (
        <footer className="bg-[#fccc00] text-[#002a86] py-10">
            <div className="container mx-auto px-6 lg:px-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* First Column: Logo and BEPMETAY */}
                    <div className="flex flex-col items-start">
                        <img src={"/storage/build/assets/Logo.png"} alt="Logo" className="w-36 mb-4"/>
                        <span className="text-2xl w-36 font-bold tracking-wide text-center">POLLOS HERMANOS</span>
                    </div>

                    {/* Second Column: Navigation Links */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">{t('FOOTER.SHOPPING_NOW')}</h2>
                        <ul className="space-y-3 text-lg">
                            <li>
                                <Link to="/" className="hover:text-[#9f1000] transition-all">{t('HEADER.HOME')}</Link>
                            </li>
                            <li>
                                <Link to="/menu" className="hover:text-[#9f1000] transition-all">{t('HEADER.MENU')}</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Third Column: Contact Information */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">{t('FOOTER.CONTACT')}</h2>
                        <table className="text-lg border-separate border-spacing-2">
                            <tbody>
                            <tr>
                                <td>{t('FOOTER.PHONE')}:</td>
                                {/* <td>0566979979</td> */}
                            </tr>
                            <tr>
                                <td></td>
                                {/* <td>0927818888</td> */}
                            </tr>
                            <tr>
                                <td>{t('FOOTER.WEBSITE')}:</td>
                                {/* <td>
                                    <a href="https://bepmetay.com" target="_blank" rel="noopener noreferrer"
                                       className="hover:text-[#9f1000] transition-all">
                                        bepmetay.com
                                    </a>
                                </td> */}
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Fourth Column: Social Media Links */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">{t('FOOTER.FOLLOW_US')}</h2>
                        <div className="flex space-x-6">
                            <a /*href="https://www.facebook.com/duyen.nguyen.344258"*/ target="_blank"
                               rel="noopener noreferrer" className="hover:text-[#9f1000] transition-all">
                                <FaFacebook className="text-3xl"/>
                            </a>
                            <a /*href="https://www.instagram.com/lat_12_12/"*/ target="_blank" rel="noopener noreferrer"
                               className="hover:text-[#9f1000] transition-all">
                                <FaInstagram className="text-3xl"/>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-5 border-t border-[#9f1000] pt-5 text-center text-lg font-medium text-[#002a86]">
                    © 2025 LOS POLLOS HERMANOS. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
