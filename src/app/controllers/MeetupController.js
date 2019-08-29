import { Op } from "sequelize";
import { isBefore, parseISO, startOfDay, endOfDay } from "date-fns";
import * as Yup from "yup";
import Meetup from "../models/Meetup";
import File from "../models/File";
import Subscription from "../models/Subscription";

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      include: [File, Subscription],
      order: [["date", "ASC"]],
      limit: 5,
      offset: 5 * page - 5,
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fails" });
    }

    const user_id = req.userId;

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: "Past dates are not permit !" });
    }

    // const date = parseISO(req.body.date);

    // const checkDate = Meetup.findOne({
    //   where:{
    //     date
    //   }
    // })
    // console.log(checkDate);

    // if(checkDate){
    //   return res.status(400).json({error : "Can not book 2 meetups at the same time"})
    // }
    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fails" });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (req.userId !== meetup.user_id) {
      return res
        .status(400)
        .json({ error: "Only meetup's creator can update the informations " });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: "Can not update past meetups." });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: "Meetup do not exist" });
    }

    if (req.userId !== meetup.user_id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    if (isBefore(parseISO(meetup.date), new Date())) {
      return res.status(400).json({ error: "Past meetup can not be deleted" });
    }

    await meetup.destroy();

    return res.json();
  }
}

export default new MeetupController();
