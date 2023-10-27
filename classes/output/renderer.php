<?php
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
 * Block Video Resources renderer.
 *
 * @package     block_recent_novelties
 * @copyright   2022 Michael Alejandro
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace block_novelties_notices\output;

defined('MOODLE_INTERNAL') || die();

use plugin_renderer_base;
use templatable;

/**
 * Block Novelties Recent renderer class.
 *
 * @package     block_novelties_and_notices
 * @copyright   2023 Michael Alejandro
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class renderer extends plugin_renderer_base
{
    /**
     * Defer to template.
     * @param templatable $reference
     * @return string
     */
    public function render_novelties(array $data) {
        return parent::render_from_template('block_novelties_notices/main', $data);
    }
}