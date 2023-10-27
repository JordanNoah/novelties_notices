// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * A javascript module to retrieve novelties information from the server.
 *
 * @module     block_novelties_and_notices/repository
 * @copyright  2023 Michael Alejandro
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Ajax from 'core/ajax';

/**
 * Retrieve a list .
 * @method getNovelties
 * @param {object} args The request arguments
 * @return {promise} Resolved with an array of courses
 */
export const getNovelties = args => {
    return executeRequest('block_recent_novelties_get_novelties', args);
};

export const markedAsRead = args => {
    return executeRequest('local_collect_novelties_information_marked_novelty_viewed', args);
};

const executeRequest = (method, args) =>{
    const request = {
        methodname: method,
        args: args
    };
    return Ajax.call([request])[0];
};
